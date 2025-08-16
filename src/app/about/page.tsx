import { BookOpen, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'مجموعه گسترده',
      description: 'دسترسی به هزاران کتاب الکترونیک در موضوعات مختلف',
    },
    {
      icon: Users,
      title: 'جامعه فعال',
      description: 'پیوستن به جامعه بزرگ خوانندگان و تبادل نظر',
    },
    {
      icon: Target,
      title: 'هدفمند',
      description: 'ارائه محتوای با کیفیت برای پیشرفت و یادگیری',
    },
    {
      icon: Award,
      title: 'با کیفیت',
      description: 'انتخاب کتاب‌های منتخب از نویسندگان معتبر',
    },
  ];

  const team = [
    {
      name: 'علی احمدی',
      role: 'مدیر محصول',
      description: 'مسئول توسعه و بهبود پلتفرم',
    },
    {
      name: 'فاطمه محمدی',
      role: 'مدیر محتوا',
      description: 'انتخاب و تدوین کتاب‌های الکترونیک',
    },
    {
      name: 'محمد رضایی',
      role: 'توسعه‌دهنده',
      description: 'طراحی و پیاده‌سازی ویژگی‌های جدید',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            درباره کتابخانه الکترونیک
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            ما یک پلتفرم آنلاین برای مطالعه کتاب‌های الکترونیک هستیم که با هدف ارائه دسترسی آسان 
            و سریع به محتوای با کیفیت طراحی شده است. ماموریت ما گسترش فرهنگ مطالعه و یادگیری 
            در جامعه است.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ماموریت ما
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ارائه پلتفرمی کاربرپسند و قابل اعتماد برای دسترسی به کتاب‌های الکترونیک با کیفیت، 
              تسهیل فرآیند مطالعه و یادگیری، و ایجاد فضایی مناسب برای رشد فکری و فرهنگی کاربران.
            </p>
          </div>
          
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              چشم‌انداز ما
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              تبدیل شدن به پیشرو در حوزه کتابخانه‌های دیجیتال و ایجاد بزرگترین مرجع آنلاین 
              کتاب‌های الکترونیک فارسی با تمرکز بر تجربه کاربری بی‌نظیر و محتوای متنوع.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            ویژگی‌های کلیدی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-full">
                      <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="card p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                ۱۰,۰۰۰+
              </div>
              <div className="text-gray-600 dark:text-gray-400">کتاب الکترونیک</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                ۵۰,۰۰۰+
              </div>
              <div className="text-gray-600 dark:text-gray-400">کاربر فعال</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                ۱۰۰+
              </div>
              <div className="text-gray-600 dark:text-gray-400">دسته‌بندی</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                ۹۹%
              </div>
              <div className="text-gray-600 dark:text-gray-400">رضایت کاربران</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            تیم ما
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 text-sm mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            سوالی دارید؟
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            تیم ما آماده پاسخگویی به سوالات شما است
          </p>
          <a
            href="/contact"
            className="btn btn-primary inline-flex items-center space-x-2 space-x-reverse"
          >
            <span>تماس با ما</span>
          </a>
        </div>

        {/* Ad Placeholder */}
        <div className="mt-12">
          <div className="ad-placeholder">
            <p>فضای تبلیغاتی</p>
          </div>
        </div>
      </div>
    </div>
  );
}
