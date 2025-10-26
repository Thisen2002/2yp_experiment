import React, { useEffect, useState } from 'react';
import VideoHero from '../components/VideoHero';
import UniversityInfo from '../components/UniversityInfo';
import { ChevronDown, Award, Users, BookOpen, Globe, type LucideIcon } from 'lucide-react';

interface UniversityFeature {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const HomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const universityData = {
    foundedYear: 1950,
    currentYear: new Date().getFullYear(),
    name: 'University of Peradeniya',
    location: 'Peradeniya, Sri Lanka',
    studentCount: '12,000+',
    facultyCount: '800+',
    departments: 9,
    achievements: [
      'Top University in Sri Lanka',
      'Excellence in Engineering & Science',
      'Outstanding Research Publications',
      'Strong Alumni Network Globally'
    ],
    description: 'The University of Peradeniya stands as the pinnacle of higher education in Sri Lanka. We continue to nurture brilliant minds, conduct groundbreaking research, and contribute to the development of our nation and the world.',
    milestones: [
      { year: 1950, event: 'University of Peradeniya Established' },
      { year: 1965, event: 'First Engineering Faculty Founded' },
      { year: 1980, event: 'Research Excellence Recognition' },
      { year: 2000, event: 'Digital Campus Initiative' },
      { year: 2020, event: 'International Accreditation Achieved' }
    ]
  };

  const universityFeatures: UniversityFeature[] = [
    {
      id: 1,
      icon: Award,
      title: 'Academic Excellence',
      description: 'Recognized as the premier university in Sri Lanka with world-class academic programs and faculty.',
      color: '#3498db'
    },
    {
      id: 2,
      icon: BookOpen,
      title: 'Research Innovation',
      description: 'Leading groundbreaking research across multiple disciplines with state-of-the-art facilities.',
      color: '#e74c3c'
    },
    {
      id: 3,
      icon: Users,
      title: 'Global Community',
      description: 'A diverse community of students, faculty, and alumni making impact worldwide.',
      color: '#f39c12'
    },
    {
      id: 4,
      icon: Globe,
      title: 'International Recognition',
      description: 'Partnerships with leading universities globally and internationally accredited programs.',
      color: '#27ae60'
    }
  ];

  const scrollToNext = (): void => {
    const nextSection = document.getElementById('university-info');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth < 768) {
        setShowScrollHint(false);
      }
    }
  };

  return (
    <>
      <div className={`min-h-screen flex flex-col transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero Section with Video */}
        <section className="relative h-screen md:h-[90vh] lg:h-screen">
          <VideoHero
            videoSrc="/intro.mp4"
            posterImage="/images/university-campus.jpg"
            title="Crowd Management System"
            subtitle="Event Scheduling and Real-Time Crowd Monitoring Platform"
            autoPlay={true}
            showControls={false}
          />

          {/* Scroll Hint */}
          {showScrollHint && (
            <div
              className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2 cursor-pointer text-white z-10"
              onClick={scrollToNext}
              role="button"
              aria-label="Scroll to university information"
            >
              <span className="text-sm sm:text-base font-medium text-shadow-sm">About</span>
              <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
            </div>
          )}
        </section>

        {/* University Information Section */}
        <section id="university-info" className="relative z-[2]">
          <UniversityInfo data={universityData} layout="default" />
        </section>

        {/* University Features Section */}
        <section id="features" className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-12 relative z-[2]">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-8 sm:mb-12 text-slate-800">
              Why Choose University of Peradeniya
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {universityFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="bg-white p-6 sm:p-8 rounded-xl shadow-md text-center transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                      style={{ backgroundColor: feature.color }}
                    >
                      <IconComponent size={20} color="white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .text-shadow-sm {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
      `}</style>
    </>
  );
};

export default HomePage;