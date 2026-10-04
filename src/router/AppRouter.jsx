import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import Home from '../pages/Home.jsx';
import Sessions from '../pages/Sessions.jsx';
import Session from '../pages/Session.jsx';
import Section from '../pages/Section.jsx';
import HardPoints from '../pages/HardPoints.jsx';
import Progress from '../pages/Progress.jsx';
import Review from '../pages/Review.jsx';
import SampleQuestions from '../pages/SampleQuestions.jsx';
import SampleSession from '../pages/SampleSession.jsx';
import SampleExam from '../pages/SampleExam.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRouter() {
  return (
    <HashRouter>
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

          {/* نمونه سوالات */}
          <Route path="/sample-questions" element={<SampleQuestions />} />
          <Route
            path="/sample-questions/session/:sessionId"
            element={<SampleSession />}
          />
          <Route
            path="/sample-questions/exam/:examId"
            element={<SampleExam />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}