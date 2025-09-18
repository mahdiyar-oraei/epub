import React, { useRef, useEffect, useState, forwardRef } from 'react';

interface EpubViewerProps {
  fontFamily: string;
  fontSize: number;
  theme: string;
  onPageChange: (newPage: number) => void;
  onTouchNavigation: (direction: string) => void;
  height?: string;
}

const EpubViewer = forwardRef<any, EpubViewerProps>(({ 
  fontFamily, 
  fontSize, 
  theme, 
  onPageChange, 
  onTouchNavigation,
  height = '100vh' 
}, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [touchStart, setTouchStart] = useState<{x: number, y: number, time: number} | null>(null);

  // Mock EPUB content for demonstration
  const mockContent = `
    <div class="epub-content" dir="rtl">
      <h1>فصل اول: آغاز سفر</h1>
      <p>در روزگاری که آسمان آبی‌تر و زمین سبزتر بود، داستان ما آغاز می‌شود. این داستان از سرزمینی دور، جایی که رویاها با واقعیت در هم می‌آمیزند، شروع می‌شود.</p>
      
      <p>شخصیت اصلی ما، جوانی به نام آرش، در دهکده‌ای کوچک در دامنه کوه‌های البرز زندگی می‌کرد. او همیشه رویای سفر به شهرهای بزرگ و کشف دنیای وسیع‌تری را در سر می‌پروراند.</p>
      
      <p>صبح زودی بود که آرش تصمیم گرفت سفر خود را آغاز کند. کوله‌پشتی کوچکش را برداشت و راهی جاده‌ای شد که به سوی افق کشیده می‌شد.</p>
      
      <h2>ملاقات با راهنما</h2>
      <p>در میانه راه، آرش با پیرمردی آشنا شد که ظاهری مرموز داشت. این پیرمرد که خود را استاد نامید، به آرش گفت که سفر او تنها یک سفر جسمانی نیست، بلکه سفری است برای کشف خود.</p>
      
      <p>"جوان، راه طولانی است و پر از چالش‌های فراوان. اما اگر قلبت پاک و نیتت راست باشد، به مقصد خواهی رسید."</p>
      
      <p>آرش با تعجب به پیرمرد نگاه کرد. چگونه این غریبه می‌توانست درباره سفر او این‌همه بداند؟</p>
      
      <h2>اولین چالش</h2>
      <p>پس از جدایی از پیرمرد، آرش به جنگلی انبوه رسید. درختان بلند و تنومند، نوری کمرنگ را به زمین می‌فرستادند. صدای پرندگان و حشرات فضایی مرموز ایجاد کرده بود.</p>
      
      <p>ناگهان، آرش صدای غرش حیوانی وحشی را شنید. قلبش تند تند می‌زد، اما تصمیم گرفت که ترس را کنار بگذارد و به راه خود ادامه دهد.</p>
      
      <p>در این لحظه بود که درس اول سفرش را آموخت: شجاعت یعنی ترسیدن اما باز هم قدم برداشتن.</p>
      
      <h2>کشف قدرت درونی</h2>
      <p>روزها گذشت و آرش چالش‌های بیشتری را پشت سر گذاشت. هر چالش او را قوی‌تر و آگاه‌تر می‌کرد. او یاد گرفت که قدرت واقعی از درون می‌آید، نه از بیرون.</p>
      
      <p>در یکی از شب‌های بارانی، زیر درخت بزرگی پناه گرفت و به ستاره‌ها نگاه کرد. در آن لحظه احساس کرد که جزئی از کیهان بزرگ است و هیچ‌گاه تنها نیست.</p>
      
      <p>این احساس او را آرام کرد و قدرت تازه‌ای به او بخشید تا به سفرش ادامه دهد.</p>
      
      <h2>بازگشت به خانه</h2>
      <p>پس از ماه‌ها سفر و تجربه، آرش تصمیم گرفت به خانه بازگردد. اما او دیگر همان جوان ساده‌ای نبود که روزی از دهکده خارج شده بود. حال او تبدیل به مردی حکیم و با تجربه شده بود.</p>
      
      <p>وقتی پای خانه گذاشت، مردم دهکده تغییرات عجیبی در او مشاهده کردند. چشمانش پر از نور و چهره‌اش آرام و مطمئن بود. آنها فهمیدند که آرش چیزی ارزشمند در سفرش یافته است.</p>
      
      <p>و از آن روز به بعد، آرش به راهنمای دیگران تبدیل شد، تا آنها نیز بتوانند راه خود را بیابند.</p>
    </div>
  `;

  useEffect(() => {
    if (viewerRef?.current) {
      // Apply styles based on props
      const content = viewerRef?.current;
      content.style.fontFamily = getFontFamily(fontFamily);
      content.style.fontSize = `${fontSize}px`;
      content.style.lineHeight = window.innerWidth < 768 ? '1.6' : '1.7';
      content.style.textAlign = 'right';
      content.style.direction = 'rtl';
      content.style.padding = window.innerWidth < 768 ? '1rem' : '2rem';
      content.style.maxWidth = window.innerWidth < 768 ? '100%' : '800px';
      content.style.margin = '0 auto';
      
      // Theme-based colors
      const colors = getThemeColors(theme);
      content.style.color = colors?.text;
      content.style.backgroundColor = colors?.background;
    }
  }, [fontFamily, fontSize, theme]);

  const getFontFamily = (family: string) => {
    switch (family) {
      case 'vazirmatn':
        return 'Vazirmatn, sans-serif';
      case 'tahoma':
        return 'Tahoma, sans-serif';
      case 'serif':
        return 'serif';
      default:
        return 'Vazirmatn, sans-serif';
    }
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'dark':
        return {
          text: '#e6eef3',
          background: '#111827'
        };
      case 'eye-care':
        return {
          text: '#7c2d12',
          background: '#fef3c7'
        };
      default:
        return {
          text: '#111827',
          background: '#ffffff'
        };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e?.touches?.[0]?.clientX,
      y: e?.touches?.[0]?.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e?.changedTouches?.[0]?.clientX,
      y: e?.changedTouches?.[0]?.clientY,
      time: Date.now()
    };

    const deltaX = touchEnd?.x - touchStart?.x;
    const deltaY = touchEnd?.y - touchStart?.y;
    const deltaTime = touchEnd?.time - touchStart?.time;

    // Check if it's a swipe (not a tap)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
      if (deltaX > 0) {
        // Swipe right - previous page (RTL)
        onTouchNavigation('prev');
      } else {
        // Swipe left - next page (RTL)
        onTouchNavigation('next');
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      // It's a tap - this will trigger dialog close via onTouchNavigation
      const screenWidth = window.innerWidth;
      const tapX = touchEnd?.x;
      
      if (tapX < screenWidth / 2) {
        // Tap on left side - next page or close dialogs
        onTouchNavigation('next');
      } else {
        // Tap on right side - previous page or close dialogs
        onTouchNavigation('prev');
      }
    }

    setTouchStart(null);
  };

  return (
    <div 
      className="w-full overflow-y-auto reading-scrollbar"
      style={{ height }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={ref}
    >
      <div
        ref={viewerRef}
        className="epub-viewer"
        dangerouslySetInnerHTML={{ __html: mockContent }}
      />
    </div>
  );
});

EpubViewer.displayName = 'EpubViewer';

export default EpubViewer;