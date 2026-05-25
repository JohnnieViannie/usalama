import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AcceptInvite from "./pages/AcceptInvite";
import Dashboard from "./pages/Dashboard";
import Guards from "./pages/Guards";
import Sites from "./pages/Sites";
import Checkpoints from "./pages/Checkpoints";
import SiteDetails from "./pages/SiteDetails";
import Shifts from "./pages/Shifts";
import ShiftGuardDetails from "./pages/ShiftGuardDetails";
import Patrols from "./pages/Patrols";
import Incidents from "./pages/Incidents";
import IncidentDetail from "./pages/IncidentDetail";
import IncidentInvestigations from "./pages/IncidentInvestigations";
import IncidentInvestigationWizard from "./pages/IncidentInvestigationWizard";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import EntranceAnalytics from "./pages/EntranceAnalytics";
import PublicRegistration from "./pages/PublicRegistration";
import LinkVisitorCheckIn from "./pages/LinkVisitorCheckIn";
import LinkVisitorCheckOut from "./pages/LinkVisitorCheckOut";
import VisitorCheckIn from "./pages/VisitorCheckIn";
import VisitorCheckOut from "./pages/VisitorCheckOut";
import RegistrationSubmissions from "./pages/RegistrationSubmissions";
import CorporateSiteSurveys from "./pages/CorporateSiteSurveys";
import SiteSurveyDetail from "./pages/SiteSurveyDetail";
import CorporateComplianceAuditReview from "./pages/CorporateComplianceAuditReview";
import CorporateComplianceAudits from "./pages/CorporateComplianceAudits";
import CorporateComplianceReport from "./pages/CorporateComplianceReport";
import CorporateComplianceSettings from "./pages/CorporateComplianceSettings";
import CorporateTraining from "./pages/CorporateTraining";
import CorporateVisitorSessions from "./pages/CorporateVisitorSessions";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/v/check-in" element={<VisitorCheckIn />} />
          <Route path="/v/check-out" element={<VisitorCheckOut />} />
          <Route path="/register/:token/visitor-in" element={<LinkVisitorCheckIn />} />
          <Route path="/register/:token/visitor-out" element={<LinkVisitorCheckOut />} />
          <Route path="/register/:token" element={<PublicRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/guards" element={<ProtectedRoute><Guards /></ProtectedRoute>} />
          <Route path="/sites" element={<ProtectedRoute><Sites /></ProtectedRoute>} />
          <Route path="/checkpoints" element={<ProtectedRoute><Checkpoints /></ProtectedRoute>} />
          <Route path="/checkpoints/:siteId" element={<ProtectedRoute><SiteDetails /></ProtectedRoute>} />
          <Route path="/shifts" element={<ProtectedRoute><Shifts /></ProtectedRoute>} />
          <Route path="/shifts/:guardId" element={<ProtectedRoute><ShiftGuardDetails /></ProtectedRoute>} />
          <Route path="/patrols" element={<ProtectedRoute><Patrols /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
          <Route path="/incidents/investigations" element={<ProtectedRoute><IncidentInvestigations /></ProtectedRoute>} />
          <Route path="/incidents/investigations/:id" element={<ProtectedRoute><IncidentInvestigationWizard /></ProtectedRoute>} />
          <Route path="/incidents/:incidentId" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/entrance-analytics" element={<ProtectedRoute><EntranceAnalytics /></ProtectedRoute>} />
          <Route path="/registration-links/:linkId/submissions" element={<ProtectedRoute><RegistrationSubmissions /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/corporate/site-surveys" element={<ProtectedRoute><CorporateSiteSurveys /></ProtectedRoute>} />
          <Route path="/corporate/site-surveys/:surveyId" element={<ProtectedRoute><SiteSurveyDetail /></ProtectedRoute>} />
          <Route path="/corporate/compliance-audits" element={<ProtectedRoute><CorporateComplianceAudits /></ProtectedRoute>} />
          <Route path="/corporate/compliance-audits/report" element={<ProtectedRoute><CorporateComplianceReport /></ProtectedRoute>} />
          <Route path="/corporate/compliance-audits/settings" element={<ProtectedRoute><CorporateComplianceSettings /></ProtectedRoute>} />
          <Route path="/corporate/compliance-audits/:auditId" element={<ProtectedRoute><CorporateComplianceAuditReview /></ProtectedRoute>} />
          <Route path="/corporate/training" element={<ProtectedRoute><CorporateTraining /></ProtectedRoute>} />
          <Route path="/corporate/visitor-sessions" element={<ProtectedRoute><CorporateVisitorSessions /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
