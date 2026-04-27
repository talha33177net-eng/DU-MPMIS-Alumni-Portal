import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Calendar, Briefcase, ChevronRight, FileText, MapPin, Image as ImageIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import css from './Home.module.css';

const Home = () => {
  const stats = { alumni: 5000, events: 120, years: 50, jobs: 350 };
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([
    {
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80",
      title: "We Are Proud Students Of Dhaka University",
      subtitle: "Connecting generations of media professionals, journalists, and communicators.",
      buttons: [
        { label: "Our Story", link: "/history", primary: false },
        { label: "Donate", link: "/donate", primary: true }
      ]
    },
    {
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80",
      title: "Mass Communication and Journalism",
      subtitle: "Building a stronger community for tomorrow.",
      buttons: [
        { label: "Election Form", link: "/elections", primary: true },
        { label: "Notice Board", link: "/notices", primary: false }
      ]
    },
    {
      image: "https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&q=80",
      title: "Alumni Association",
      subtitle: "Upholding the legacy of excellence defined by our alma mater.",
      buttons: [
        { label: "Join Us", link: "/register", primary: true }
      ]
    }
  ]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Data fetching for recent sections
  const [recentNotices, setRecentNotices] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [websiteConfig, setWebsiteConfig] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noticesRes, jobsRes, blogsRes, eventsRes, contentRes] = await Promise.all([
          api.get('/notices?per_page=5'),
          api.get('/careers?per_page=5'),
          api.get('/blogs?per_page=4'),
          api.get('/events?type=upcoming&per_page=5'),
          api.get('/website-content')
        ]);
        setRecentNotices(noticesRes?.data || []);
        setRecentJobs(jobsRes?.data || []);
        setRecentBlogs(blogsRes?.data || []);
        setRecentEvents(eventsRes?.data || []);
        
        const content = contentRes?.data || contentRes;
        if (content) {
           setWebsiteConfig(content);
           if (content.heroBannersJson) {
           try {
              const parsed = JSON.parse(content.heroBannersJson);
              if (parsed && parsed.length > 0) {
                 setSlides(parsed.map(s => ({
                    image: s.image?.startsWith('http') ? s.image : (s.image ? `${import.meta.env.PROD ? "" : "http://localhost:5001"}${s.image}` : ''),
                    title: s.title,
                    subtitle: s.subtitle,
                    buttons: s.buttons && s.buttons.length > 0 ? s.buttons : [{ label: "Explore Portal", link: "/about", primary: true }]
                 })));
              }
           } catch { /* Suppress parse errors and fallback array */ }
         }
        }
      } catch (err) {
        console.error("Failed to fetch recent data", err);
      }
    };
    fetchData();
  }, []);

  // Combine all updates for the marquee
  const allUpdates = [
    ...recentNotices.map(n => ({ id: `n-${n.id}`, type: 'Notice', title: n.title, date: n.publishedAt || n.createdAt, link: `/notices` })),
    ...recentJobs.map(j => ({ id: `j-${j.id}`, type: 'Job', title: j.title, date: j.createdAt, link: `/careers` })),
    ...recentEvents.map(e => ({ id: `e-${e.id}`, type: 'Event', title: e.title, date: e.createdAt || e.eventDate, link: `/events` }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <div className={css.homeContainer}>
      {/* Hero Carousel */}
      <section className={css.hero}>
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`${css.slide} ${index === currentSlide ? css.slideActive : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={css.heroOverlay} />
            <div className={`container ${css.heroContent}`}>
              <div className={css.heroTextWrapper}>
                <div className={css.heroText}>
                  <div className={css.heroBadge}>Welcome to DU MPMIS</div>
                  <h1 className={css.title}>{slide.title}</h1>
                  <p className={css.subtitle}>{slide.subtitle}</p>
                  <div className={css.heroButtons}>
                    {slide.buttons.map((btn, btnIdx) => (
                      <Link key={btnIdx} to={btn.link} className={`btn ${btn.primary ? 'btn-primary' : 'btn-secondary'} ${css.heroBtn}`}>
                        {btn.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Carousel indicators */}
        <div className={css.carouselIndicators}>
          {slides.map((_, index) => (
            <button 
              key={index} 
              className={`${css.indicator} ${index === currentSlide ? css.indicatorActive : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        {/* Scroll Indicator */}
        <div className={css.scrollIndicator}>
          <div className={css.mouse}>
            <div className={css.wheel}></div>
          </div>
        </div>
      </section>

      {/* Marquee Notice Board */}
      <div className={css.marqueeSection}>
        <div className="container">
          <div className={css.marqueeWrapper}>
            <div className={css.marqueeLabel}>Latest Updates</div>
            <div className={css.marqueeContent}>
              <div className={css.marqueeInner}>
                {allUpdates.length > 0 ? allUpdates.map((item) => (
                  <Link to={item.link} key={item.id} className={css.marqueeItem}>
                    <span className={css.marqueeDate}>{item.date ? item.date.substring(0, 10) : ''} <span style={{marginLeft: '0.4rem', borderLeft: '1px solid currentColor', paddingLeft: '0.4rem', textTransform: 'uppercase'}}>{item.type}</span></span>
                    {item.title}
                  </Link>
                )) : (
                  <span className={css.marqueeItem}>Welcome to DU MPMIS official portal.</span>
                )}
                {/* Duplicate for seamless scrolling, if there are items */}
                {allUpdates.length > 0 && allUpdates.map((item) => (
                  <Link to={item.link} key={`dup-${item.id}`} className={css.marqueeItem}>
                    <span className={css.marqueeDate}>{item.date ? item.date.substring(0, 10) : ''} <span style={{marginLeft: '0.4rem', borderLeft: '1px solid currentColor', paddingLeft: '0.4rem', textTransform: 'uppercase'}}>{item.type}</span></span>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome / Mission Section */}
      <section className={`section ${css.welcomeSection}`}>
        <div className={`container ${css.welcomeContainer}`}>
          <div className={css.welcomeImages}>
            <img loading="lazy" src={websiteConfig.aboutImage ? (websiteConfig.aboutImage.startsWith('http') ? websiteConfig.aboutImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${websiteConfig.aboutImage}`) : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80"} alt="Campus Life" className={css.welcomeImgMain} />
            <img loading="lazy" src={websiteConfig.heroBannerImage ? (websiteConfig.heroBannerImage.startsWith('http') ? websiteConfig.heroBannerImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${websiteConfig.heroBannerImage}`) : "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80"} alt="Students" className={css.welcomeImgSub} />
            <div className={css.experienceBadge}>
              <span className={css.expNumber}>{websiteConfig.yearsActive ?? '50'}+</span>
              <span className={css.expText}>Years of<br/>Legacy</span>
            </div>
          </div>
          <div className={css.welcomeText}>
            <div className={css.sectionLabel}>Welcome to DU MPMIS</div>
            <h2 className={css.sectionTitle}>{websiteConfig.aboutTitle || "Uniting Generations of Media Professionals"}</h2>
            <div className={css.welcomeDesc}>
              {websiteConfig.aboutContent ? websiteConfig.aboutContent.split('\n').map((paragraph, i) => (
                <p key={i} style={{ marginBottom: '1rem' }}>{paragraph}</p>
              )) : (
                <>
                  <p style={{ marginBottom: '1rem' }}>The Dhaka University Mass Communication and Journalism Alumni Association (DU MPMIS) represents a prestigious network of intellectual leaders, journalists, and strategic communicators worldwide.</p>
                  <p>Since our inception, we have passionately fostered professional excellence, academic collaboration, and meaningful engagements. We are more than an association; we are a family dedicated to empowering the next generation of media pioneers.</p>
                </>
              )}
            </div>
            <div className={css.welcomeFeatures}>
              <div className={css.feature}><div className={css.featureIcon}><Check size={14} /></div> Global Networking</div>
              <div className={css.feature}><div className={css.featureIcon}><Check size={14} /></div> Career Advancement</div>
              <div className={css.feature}><div className={css.featureIcon}><Check size={14} /></div> Exclusive Events</div>
              <div className={css.feature}><div className={css.featureIcon}><Check size={14} /></div> Mentorship Programs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Dynamic Stats */}
      <section className={css.dynamicStatsWrapper}>
         <div className={`container ${css.dynamicStatsContainer}`}>
            <div className={css.statNode}>
               <div className={css.statIconWrapper}><Users size={28} /></div>
               <div className={css.statData}>
                  <h3>{websiteConfig.totalMembers ?? '5000'}+</h3>
                  <p>Registered Alumni</p>
               </div>
            </div>
            <div className={css.statNode}>
               <div className={css.statIconWrapper}><Calendar size={28} /></div>
               <div className={css.statData}>
                  <h3>{websiteConfig.totalEvents ?? '120'}+</h3>
                  <p>Hosted Events</p>
               </div>
            </div>
            <div className={css.statNode}>
               <div className={css.statIconWrapper}><GraduationCap size={28} /></div>
               <div className={css.statData}>
                  <h3>{websiteConfig.yearsActive ?? '50'}</h3>
                  <p>Years of Legacy</p>
               </div>
            </div>
            <div className={css.statNode}>
               <div className={css.statIconWrapper}><Briefcase size={28} /></div>
               <div className={css.statData}>
                  <h3>{websiteConfig.totalLifeMembers ?? '350'}+</h3>
                  <p>Careers Launched</p>
               </div>
            </div>
         </div>
      </section>

      {/* Premium Career Board */}
      <section className={`section ${css.careerSection}`}>
        <div className="container">
          <div className={css.sectionHeaderWithLink}>
            <div>
              <div className={css.sectionLabel}>Opportunities</div>
              <h2 className={css.sectionTitle}>Exclusive Career Board</h2>
            </div>
            <Link to="/careers" className="btn btn-outline">Explore All Openings</Link>
          </div>

          <div className={css.careerGrid}>
            {recentJobs.length > 0 ? recentJobs.map((job, idx) => (
              <div key={job.id} className={css.careerTicket} style={{animationDelay: `${idx*0.1}s`}}>
                 <div className={css.ticketLeft}>
                    <div className={css.ticketDate}>
                       <span className={css.tdDay}>{new Date().getDate()}</span>
                       <span className={css.tdMonth}>NEW</span>
                    </div>
                 </div>
                 <div className={css.ticketBody}>
                    <h3 className={css.ticketTitle}>{job.title}</h3>
                    <p className={css.ticketCompany}>{job.companyName}</p>
                    <div className={css.ticketMeta}>
                       <span className={css.metaPill}><MapPin size={14}/> {job.location || 'Remote'}</span>
                       <span className={css.metaPill}><Briefcase size={14}/> {job.type || 'Full Time'}</span>
                    </div>
                 </div>
                 <div className={css.ticketRight}>
                    <Link to="/careers" className={css.ticketApply}>View</Link>
                 </div>
              </div>
            )) : (
               <div className={css.emptyState}>No recent career opportunities posted.</div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Blogs */}
      <section className={`section ${css.blogSection}`}>
        <div className="container">
          <div className={css.sectionHeaderWithLink}>
             <div>
                <div className={css.sectionLabel}>Alumni Voices</div>
                <h2 className={css.sectionTitle}>Latest Stories & Insights</h2>
             </div>
             <Link to="/blog" className="btn btn-outline">Read The Blog</Link>
          </div>

          <div className={css.modernBlogGrid}>
            {recentBlogs.length > 0 ? recentBlogs.map(blog => (
              <Link to={`/blog/${blog.slug}`} key={blog.id} className={css.modernBlogCard}>
                <div className={css.modernBlogImage}>
                  {blog.coverImage ? <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${blog.coverImage}`} alt={blog.title} /> : <div className={css.placeholderCover}><FileText size={40}/></div>}
                  <div className={css.blogImageOverlay}></div>
                  <div className={css.blogBadge}>Read Article Hub</div>
                </div>
                <div className={css.modernBlogBody}>
                  <div className={css.modernBlogMeta}>
                     <span className={css.mbmAuthor}>By {blog.authorName || 'Guest'}</span>
                     <span className={css.mbmDate}>{blog.createdAt ? format(new Date(blog.createdAt), 'MMM dd, yyyy') : 'Recently'}</span>
                  </div>
                  <h3 className={css.modernBlogTitle}>{blog.title}</h3>
                </div>
              </Link>
            )) : (
              <div className={css.emptyState}>No articles published recently. Check back soon.</div>
            )}
          </div>
        </div>
      </section>

      {/* Abstract Animated CTA */}
      <section className={css.abstractCta}>
        <div className={css.ctaGeometricBg}></div>
        <div className={css.ctaGeometricBg2}></div>
        <div className={`container ${css.abstractCtaInner}`}>
           <h2 className={css.abstractCtaTitle}>Claim Your Permanent Place in History</h2>
           <p className={css.abstractCtaDesc}>
              Upgrade your standing to Life Member today and unlock exclusive voting privileges, premium networking events, and the official DU MPMIS premium directory listing.
           </p>
           <div style={{display: 'flex', gap: '1rem', flexWrap:'wrap', justifyContent:'center'}}>
              <Link to="/register" className={`btn btn-primary ${css.pulseBtn}`}>Apply for Membership</Link>
              <Link to="/contact" className="btn btn-outline" style={{borderColor:'rgba(255,255,255,0.4)', color:'white'}}>Contact Support</Link>
           </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

