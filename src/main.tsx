import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { Toaster } from "sonner";

import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
   <AuthProvider>
     <WorkspaceProvider>
    <App />
     <Toaster position="top-right" />
     </WorkspaceProvider>
    </AuthProvider>
  </BrowserRouter>,
)
