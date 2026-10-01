import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import Home from '../pages/Home.jsx';
import Sessions from '../pages/Sessions.jsx';
import Session from '../pages/Session.jsx';
import Section from '../pages/Section.jsx';
import HardPoints from '../pages/HardPoints.jsx';
import Progress from '../pages/Progress.jsx';
import Review from '../pages/Review.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter basename="/hematology-course">
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session/:sessionId" element={<Session />} />
          <Route
            path="/session/:sessionId/section/:sectionId"
            element={<Section />}
          />
          <Route path="/hard-points" element={<HardPoints />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/review" element={<Review />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}