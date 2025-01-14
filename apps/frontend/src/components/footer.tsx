import { FeedbackDialog } from "./feedback-dialog";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  return (
    <footer className="w-full border-t bg-white fixed bottom-0">
      <div className="flex w-full justify-center items-center gap-8 text-sm text-gray-600 p-4">
        <div className="flex items-center">
          {location.pathname !== '/' && <FeedbackDialog />}
        </div>
        {/* <a href="/about" className="hover:text-gray-900 transition-colors">
              About
            </a>
            <a href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </a> */}
        © {new Date().getFullYear()} OHsync. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;