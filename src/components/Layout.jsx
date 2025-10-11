import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getCuratedImage } from '../lib/images';

const Layout = ({ 
  title, 
  description, 
  children, 
  actions,
  showHero = false,
  heroKeyword = 'healthcare'
}) => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (showHero) {
      setLoading(true);
      const fetchHeroImage = async () => {
        try {
          const image = await getCuratedImage(heroKeyword);
          setHeroImage(image);
        } catch (error) {
          console.warn('Failed to load hero image:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchHeroImage();
    }
  }, [showHero, heroKeyword]);

  return (
    <div className="flex-1 pb-16">
      {showHero && (
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
          ) : heroImage ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${heroImage.url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
          )}
          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {title}
              </h1>
              {description && (
                <p className="text-lg text-white/90 max-w-2xl mx-auto">
                  {description}
                </p>
              )}
              {actions && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'default'}
                      onClick={action.onClick}
                      className={action.className}
                    >
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="container py-8">
        {!showHero && (title || description) && (
          <Card className="mb-8 border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl">
                    {title}
                  </CardTitle>
                  {description && (
                    <CardDescription className="mt-2">
                      {description}
                    </CardDescription>
                  )}
                </div>
                {actions && (
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'default'}
                        onClick={action.onClick}
                        size={action.size || 'default'}
                      >
                        {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        )}
        
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;