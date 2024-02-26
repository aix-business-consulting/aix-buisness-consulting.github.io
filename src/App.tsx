import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

// export default function App() {
//   return (
//   );
// }
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home-page"; // Adjust the path as necessary
import UploadExcel from "./pages/upload-excel"; // Adjust the path as necessary
// import YourNewPage from './pages/YourNewPage'; // Adjust the path as necessary

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadExcel />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
