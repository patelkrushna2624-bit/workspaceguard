import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  // ---------------------------------------------------------
  // 1. CORS
  // ---------------------------------------------------------

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // ---------------------------------------------------------
  // 2. Only POST requests
  // ---------------------------------------------------------

  if (req.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed.",
      },
      405,
    );
  }

  try {
    // ---------------------------------------------------------
    // 3. Environment variables
    // ---------------------------------------------------------

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey
    ) {
      console.error(
        "Missing Supabase environment variables.",
      );

      return jsonResponse(
        {
          error: "Server configuration error.",
        },
        500,
      );
    }

    // ---------------------------------------------------------
    // 4. Get Authorization header
    // ---------------------------------------------------------

    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        {
          error:
            "Missing authorization header.",
        },
        401,
      );
    }

    // ---------------------------------------------------------
    // 5. Create client using current user's JWT
    // ---------------------------------------------------------

    const supabaseUser = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    // ---------------------------------------------------------
    // 6. Verify current logged-in user
    // ---------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error(
        "AUTH ERROR:",
        userError,
      );

      return jsonResponse(
        {
          error: "Unauthorized.",
        },
        401,
      );
    }

    // ---------------------------------------------------------
    // 7. Read request body
    // ---------------------------------------------------------

    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId.trim()
        : "";

    // ---------------------------------------------------------
    // 8. Validate email
    // ---------------------------------------------------------

    if (!email) {
      return jsonResponse(
        {
          error: "Email is required.",
        },
        400,
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return jsonResponse(
        {
          error:
            "Please provide a valid email address.",
        },
        400,
      );
    }

    // ---------------------------------------------------------
    // 9. Validate workspace ID
    // ---------------------------------------------------------

    if (!workspaceId) {
      return jsonResponse(
        {
          error:
            "Workspace ID is required.",
        },
        400,
      );
    }

    // ---------------------------------------------------------
    // 10. Create service-role admin client
    // ---------------------------------------------------------

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    // ---------------------------------------------------------
    // 11. Verify workspace ownership
    // ---------------------------------------------------------

    const {
      data: workspace,
      error: workspaceError,
    } = await supabaseAdmin
      .from("workspaces")
      .select(
        "id, name, owner_id",
      )
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (workspaceError) {
      console.error(
        "WORKSPACE CHECK ERROR:",
        workspaceError,
      );

      return jsonResponse(
        {
          error:
            "Unable to verify workspace.",
        },
        500,
      );
    }

    if (!workspace) {
      return jsonResponse(
        {
          error:
            "You do not have permission to invite members to this workspace.",
        },
        403,
      );
    }

    // ---------------------------------------------------------
    // 12. Prevent inviting yourself
    // ---------------------------------------------------------

    if (
      user.email &&
      user.email.toLowerCase() === email
    ) {
      return jsonResponse(
        {
          error:
            "You cannot invite yourself to the workspace.",
        },
        400,
      );
    }

    // ---------------------------------------------------------
    // 13. Check if user already exists
    // ---------------------------------------------------------

    const {
      data: existingUsers,
      error: usersError,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error(
        "USER CHECK ERROR:",
        usersError,
      );

      return jsonResponse(
        {
          error: usersError.message,
        },
        500,
      );
    }

    const existingUser =
      existingUsers.users.find(
        (existingUser) =>
          existingUser.email?.toLowerCase() ===
          email,
      );

    if (existingUser) {
      return jsonResponse(
        {
          error:
            "A user with this email address already exists. Delete the old test user from Supabase Authentication > Users before sending another test invitation.",
        },
        400,
      );
    }

    // ---------------------------------------------------------
    // 14. Invitation redirect
    // ---------------------------------------------------------

    const redirectTo =
      "https://workspaceguard.vercel.app/accept-invite";

    console.log(
      "Sending invitation to:",
      email,
    );

    console.log(
      "Invitation redirect:",
      redirectTo,
    );

    // ---------------------------------------------------------
    // 15. Send Supabase invitation
    // ---------------------------------------------------------

    const {
      data: inviteData,
      error: inviteError,
    } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo,
        },
      );

    if (inviteError) {
      console.error(
        "INVITE ERROR:",
        inviteError,
      );

      return jsonResponse(
        {
          error: inviteError.message,
        },
        400,
      );
    }

    const invitedUser =
      inviteData.user;

    if (!invitedUser) {
      return jsonResponse(
        {
          error:
            "Invitation user was not created.",
        },
        500,
      );
    }

    // ---------------------------------------------------------
    // 16. Create / update profile
    // ---------------------------------------------------------

    const {
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: invitedUser.id,
          full_name:
            email.split("@")[0],
          email,
        },
        {
          onConflict: "id",
        },
      );

    if (profileError) {
      console.error(
        "PROFILE ERROR:",
        profileError,
      );

      await supabaseAdmin.auth.admin.deleteUser(
        invitedUser.id,
      );

      return jsonResponse(
        {
          error:
            "Invitation was created, but the profile could not be created.",
        },
        500,
      );
    }

    // ---------------------------------------------------------
    // 17. Check workspace membership
    // ---------------------------------------------------------

    const {
      data: existingMembership,
      error: membershipCheckError,
    } = await supabaseAdmin
      .from("workspace_members")
      .select("id")
      .eq(
        "workspace_id",
        workspaceId,
      )
      .eq(
        "user_id",
        invitedUser.id,
      )
      .maybeSingle();

    if (membershipCheckError) {
      console.error(
        "MEMBERSHIP CHECK ERROR:",
        membershipCheckError,
      );

      await supabaseAdmin.auth.admin.deleteUser(
        invitedUser.id,
      );

      return jsonResponse(
        {
          error:
            "Could not verify workspace membership.",
        },
        500,
      );
    }

    if (existingMembership) {
      return jsonResponse(
        {
          error:
            "This user is already a member of the workspace.",
        },
        400,
      );
    }

    // ---------------------------------------------------------
    // 18. Create workspace membership
    // ---------------------------------------------------------

    const {
      data: member,
      error: memberError,
    } = await supabaseAdmin
      .from("workspace_members")
      .insert({
        workspace_id: workspaceId,
        user_id: invitedUser.id,
        role: "viewer",
        can_edit: false,
        can_delete: false,
        can_invite: false,
      })
      .select()
      .single();

    if (memberError) {
      console.error(
        "WORKSPACE MEMBER ERROR:",
        memberError,
      );

      await supabaseAdmin.auth.admin.deleteUser(
        invitedUser.id,
      );

      return jsonResponse(
        {
          error:
            "Invitation was sent, but the workspace member could not be created.",
        },
        500,
      );
    }

    // ---------------------------------------------------------
    // 19. Success
    // ---------------------------------------------------------

    console.log(
      "INVITATION SUCCESS:",
      email,
    );

    return jsonResponse(
      {
        message:
          "Invitation sent successfully.",
        user: {
          id: invitedUser.id,
          email: invitedUser.email,
        },
        member,
      },
      200,
    );
  } catch (error) {
    console.error(
      "FUNCTION ERROR:",
      error,
    );

    return jsonResponse(
      {
        error:
          "Something went wrong while sending the invitation.",
      },
      500,
    );
  }
});