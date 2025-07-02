import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // For app proxy requests, redirect to the actual wholesale page
  if (url.pathname.startsWith('/apps/wholesale')) {
    return redirect('/pages/wholesale');
  }

  // This route serves as a fallback/landing page for wholesale
  return json({
    message: "Wholesale Portal",
    redirectToTheme: true
  });
}

export default function WholesaleIndex() {
  return (
    <div className="wholesale-landing">
      <h1>Wholesale Portal</h1>
      <p>Welcome to our wholesale section!</p>
      
      <div className="wholesale-actions">
        <p>
          <strong>For Customers:</strong> Please visit our{" "}
          <a href="/pages/wholesale" target="_blank" rel="noopener noreferrer">
            wholesale storefront page
          </a>{" "}
          to access wholesale pricing and products.
        </p>
        
        <p>
          <strong>New to Wholesale?</strong>{" "}
          <a href="/pages/wholesale-register" target="_blank" rel="noopener noreferrer">
            Apply for wholesale access
          </a>
        </p>
      </div>

      <div className="admin-section">
        <h2>Admin Tools</h2>
        <Link to="/app/wholesale/dashboard" className="btn btn-primary">
          Manage Wholesale Applications
        </Link>
      </div>

      <style>{`
        .wholesale-landing {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          text-align: center;
        }
        
        .wholesale-actions {
          margin: 2rem 0;
          text-align: left;
        }
        
        .wholesale-actions p {
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .admin-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #ddd;
        }
        
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #0066cc;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 0.5rem;
        }
        
        .btn:hover {
          background: #0052a3;
        }
      `}</style>
    </div>
  );
}
