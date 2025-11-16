import { Link } from "wouter";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CMSPage {
  id: string;
  pageKey: string;
  pageName: string;
  footerSection?: "company" | "support" | "legal" | "resources" | "none";
  isPublished: boolean;
}

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Fetch published CMS pages
  const { data: cmsPages = [] } = useQuery<CMSPage[]>({
    queryKey: ["cmsPages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/cms-content");
      return response.json();
    },
  });

  // Filter and group published pages by footer section
  const publishedPages = cmsPages.filter((page) => page.isPublished);
  const companyPages = publishedPages.filter((p) => p.footerSection === "company");
  const supportPages = publishedPages.filter((p) => p.footerSection === "support");
  const legalPages = publishedPages.filter((p) => p.footerSection === "legal");
  const resourcePages = publishedPages.filter((p) => p.footerSection === "resources");
  
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground" data-testid="text-footer-logo">
                TravelHub
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4" data-testid="text-footer-description">
              {t('home.discover_world')}
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-2.137 0-3.864-1.729-3.864-3.866s1.727-3.864 3.864-3.864c2.136 0 3.864 1.727 3.864 3.864s-1.728 3.866-3.864 3.866zm7.679 0c-2.136 0-3.864-1.729-3.864-3.866s1.728-3.864 3.864-3.864c2.137 0 3.864 1.727 3.864 3.864s-1.727 3.866-3.864 3.866z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-linkedin"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Company */}
          {companyPages.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4" data-testid="text-footer-company-title">
                {t('footer.company')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {companyPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/${page.pageKey}`}
                      className="hover:text-foreground transition-colors"
                      data-testid={`link-${page.pageKey}`}
                    >
                      {page.pageName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support */}
          {supportPages.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4" data-testid="text-footer-support-title">
                {t('footer.support')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {supportPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/${page.pageKey}`}
                      className="hover:text-foreground transition-colors"
                      data-testid={`link-${page.pageKey}`}
                    >
                      {page.pageName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {resourcePages.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4" data-testid="text-footer-resources-title">
                {t('footer.resources')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {resourcePages.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/${page.pageKey}`}
                      className="hover:text-foreground transition-colors"
                      data-testid={`link-${page.pageKey}`}
                    >
                      {page.pageName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal - If there are legal pages, show them in a separate column */}
          {legalPages.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4" data-testid="text-footer-legal-title">
                {t('footer.legal') || "Legal"}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {legalPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/${page.pageKey}`}
                      className="hover:text-foreground transition-colors"
                      data-testid={`link-${page.pageKey}`}
                    >
                      {page.pageName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
