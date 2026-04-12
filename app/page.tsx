import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Header Optimized for Perfect Centering */}
      <nav className="bg-[#0a0706] border-b-4 gold-border-3d py-8 px-16 flex justify-between items-center relative z-50">
        <div className="w-1/4 flex justify-start">
          <span
            className="material-symbols-outlined text-5xl gold-inlay"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            temple_hindu
          </span>
        </div>

        {/* Absolute Centering for Title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-6xl font-headline font-bold gold-inlay tracking-[0.1em] text-center leading-tight pointer-events-auto whitespace-nowrap">
            BEIS MEDRASH D JACKSON 21
          </h1>
        </div>

        <div className="w-1/4 flex flex-col items-end">
          <div className="flex items-center gap-4 mb-1">
            <span className="material-symbols-outlined text-2xl text-primary opacity-80">
              calendar_today
            </span>
            <span className="material-symbols-outlined text-2xl text-primary opacity-80">
              schedule
            </span>
          </div>
          <span className="text-xl font-headline font-bold text-primary tracking-widest uppercase">
            Friday, Oct 27, 2023
          </span>
          <span className="text-sm font-headline opacity-60 italic tracking-widest uppercase text-secondary">
            12 Cheshvan 5784
          </span>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="flex-1 wood-grain overflow-hidden flex flex-col p-10">
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-8">
          {/* Left Column: Zmanim */}
          <div className="col-span-3 flex flex-col gap-8">
            {/* Shabbat Zmanim */}
            <div className="bg-surface-container-high elevated-3d border-t-4 gold-border-3d flex flex-col flex-1 rounded-sm overflow-hidden">
              <h2 className="text-primary font-headline text-center py-4 text-xl tracking-[0.2em] font-bold border-b border-white/10 uppercase bg-black/40">
                Shabbat Zmanim
              </h2>
              <div className="flex-1 p-6 flex flex-col justify-around">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Candle Lighting
                  </p>
                  <p className="text-primary font-headline font-bold text-4xl text-3d">
                    5:42 PM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Mincha & Kabbalat
                  </p>
                  <p className="text-primary font-headline font-bold text-4xl text-3d">
                    5:45 PM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Shacharit
                  </p>
                  <p className="text-primary font-headline font-bold text-4xl text-3d">
                    9:00 AM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Mincha
                  </p>
                  <p className="text-primary font-headline font-bold text-4xl text-3d">
                    5:30 PM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Havdalah
                  </p>
                  <p className="text-primary font-headline font-bold text-4xl text-3d">
                    6:41 PM
                  </p>
                </div>
              </div>
              <div className="bg-black/50 py-2 text-center border-t border-white/5">
                <p className="text-xs tracking-[0.4em] font-bold text-primary/80 uppercase italic">
                  Parshat Vayeira
                </p>
              </div>
            </div>

            {/* Daily Zmanim */}
            <div className="bg-surface-container-high elevated-3d border-t-4 gold-border-3d flex flex-col flex-1 rounded-sm overflow-hidden">
              <h2 className="text-primary font-headline text-center py-4 text-xl tracking-[0.2em] font-bold border-b border-white/10 uppercase bg-black/40">
                Daily Zmanim
              </h2>
              <div className="flex-1 p-6 flex flex-col justify-around">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Alot HaShachar
                  </p>
                  <p className="text-primary font-headline font-bold text-3xl text-3d">
                    5:58 AM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Sunrise
                  </p>
                  <p className="text-primary font-headline font-bold text-3xl text-3d">
                    7:14 AM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Latest Shema
                  </p>
                  <p className="text-primary font-headline font-bold text-3xl text-3d">
                    9:56 AM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary mb-1">
                    Sunset (Shkia)
                  </p>
                  <p className="text-primary font-headline font-bold text-3xl text-3d">
                    5:52 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Announcements Stacked */}
          <div className="col-span-6 flex flex-col gap-8">
            {/* Shul Announcements */}
            <div className="parchment-muted elevated-3d border-t-4 gold-border-3d flex flex-col flex-1 rounded-sm overflow-hidden">
              <h2 className="text-center font-headline text-2xl py-4 border-b border-white/10 tracking-[0.3em] font-bold uppercase bg-black/40 text-primary">
                Shul Announcements
              </h2>
              <div className="p-6 flex-1 flex gap-8 items-center justify-center">
                <div className="relative w-48 aspect-[4/5] elevated-3d border-4 border-primary/30 rounded-sm overflow-hidden flex-shrink-0">
                  <Image
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1chIswQ7KY6RZQA5tAZ5JLyZyjZ40Sxj_FXOXfyHHY_hb3OaNusAw0zR56InT__nLUpK0HLS-QwLWSqJZSMJpG7p08XyvKGuVl4lpW2PynOIdOrd-iVEfs5h80HsQprt5paokA10Ys8WLFs9Ke_009KcWIHzpLE2YjlIIMg03fVGFMKdObCgybbmbC5f70WHEENa0lJIZhPtj2wI-5vl35JdVTfQsgZgkw2ynf87Ye716T6uo4MxVSyYxMoPk47XTyowlFlabe2w_"
                    alt="Winter Clothing Drive"
                    width={192}
                    height={240}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="text-left flex-1 max-w-sm">
                  <h3 className="font-headline text-3xl font-bold text-primary mb-2 text-3d">
                    Winter Clothing Drive
                  </h3>
                  <p className="text-lg italic text-secondary leading-relaxed">
                    Ongoing collection for local families in the main lobby bins.
                    Please ensure items are gently used and clean.
                  </p>
                </div>
              </div>
            </div>

            {/* Community Announcements */}
            <div className="bg-surface-container-high elevated-3d border-t-4 gold-border-3d flex flex-col flex-1 rounded-sm overflow-hidden">
              <h2 className="text-center font-headline text-2xl py-4 border-b border-white/10 tracking-[0.3em] font-bold uppercase bg-black/40 text-primary">
                Community Announcements
              </h2>
              <div className="p-6 flex-1 flex justify-around items-center text-center">
                <div className="flex-1 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/80">
                    Mazel Tov Birthdays
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="font-headline text-2xl italic font-bold text-primary text-3d">
                      Sarah Goldberg
                    </p>
                    <p className="font-headline text-2xl italic font-bold text-primary text-3d">
                      Avi Steinmetz
                    </p>
                    <p className="font-headline text-2xl italic font-bold text-primary text-3d">
                      Meir Cohen
                    </p>
                  </div>
                </div>
                <div className="w-px h-24 bg-white/10 mx-4" />
                <div className="flex-1 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/80">
                    Anniversaries
                  </p>
                  <p className="font-headline text-2xl italic font-bold text-primary text-3d">
                    Mr. & Mrs. Kaplan
                  </p>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-secondary">
                    25 Golden Years
                  </p>
                </div>
                <div className="w-px h-24 bg-white/10 mx-4" />
                <div className="flex-1 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/80">
                    New Addition
                  </p>
                  <p className="font-headline text-2xl italic font-bold text-primary text-3d">
                    The Levi Family
                  </p>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-secondary">
                    Birth of a Baby Girl
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Weekly Schedule & Sponsor */}
          <div className="col-span-3 flex flex-col gap-8">
            {/* Weekly Schedule */}
            <div className="bg-surface-container-high elevated-3d border-t-4 gold-border-3d flex flex-col flex-1 rounded-sm overflow-hidden">
              <h2 className="text-primary font-headline text-center py-4 text-xl tracking-[0.2em] font-bold border-b border-white/10 uppercase bg-black/40 whitespace-nowrap">
                Weekly Schedule
              </h2>
              <div className="flex-1 p-6 flex flex-col justify-between py-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-secondary mb-1">
                    Shachris (Sun)
                  </p>
                  <p className="text-primary font-headline font-bold text-2xl text-3d">
                    7:30 / 8:30 AM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-secondary mb-1">
                    Shachris (M-F)
                  </p>
                  <p className="text-primary font-headline font-bold text-2xl text-3d">
                    6:30 / 7:30 AM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-secondary mb-1">
                    Mincha / Maariv
                  </p>
                  <p className="text-primary font-headline font-bold text-2xl text-3d">
                    5:40 PM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-secondary mb-1">
                    Late Maariv
                  </p>
                  <p className="text-primary font-headline font-bold text-2xl text-3d">
                    9:00 PM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-secondary mb-1">
                    Morning Seder
                  </p>
                  <p className="text-primary font-headline font-bold text-2xl text-3d">
                    8:15 AM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-secondary mb-1">
                    Night Seder
                  </p>
                  <p className="text-primary font-headline font-bold text-2xl text-3d">
                    8:30 PM
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-secondary mb-1">
                    Shiur from Rav
                  </p>
                  <p className="text-primary font-headline font-bold text-2xl text-3d">
                    8:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Sponsor Section */}
            <div className="brass-plaque p-6 flex items-center justify-center gap-5 rounded-sm flex-none relative overflow-hidden group">
              {/* Decorative rivet heads */}
              <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-black/20 shadow-inner" />
              <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-black/20 shadow-inner" />
              <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-black/20 shadow-inner" />
              <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-black/20 shadow-inner" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="flex flex-col w-full relative z-10 gap-3 px-2">
                <div className="text-center">
                  <p className="text-[8px] text-on-primary uppercase tracking-[0.3em] font-bold opacity-80">
                    Kiddush Sponsored By
                  </p>
                  <h3 className="font-headline text-lg text-on-primary font-bold tracking-[0.05em] whitespace-nowrap drop-shadow-sm">
                    THE COHEN FAMILY
                  </h3>
                </div>
                <div className="h-px bg-on-primary/20 w-3/4 mx-auto" />
                <div className="text-center">
                  <p className="text-[8px] text-on-primary uppercase tracking-[0.3em] font-bold opacity-80">
                    Ner LaMoar Sponsored By
                  </p>
                  <h3 className="font-headline text-lg text-on-primary font-bold tracking-[0.05em] whitespace-nowrap drop-shadow-sm">
                    ANONYMOUS
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Static Info Bar */}
      <div className="bg-[#0a0706] border-y-4 gold-border-3d h-16 flex items-center shadow-xl relative z-40 overflow-hidden">
        <div className="px-10 text-primary font-headline text-2xl flex w-full justify-between items-center">
          <span className="flex items-center gap-6 font-bold text-3xl glow-text-hebrew pt-1">
            משיב הרוח ומוריד הגשם
          </span>
          <span className="tracking-[0.2em] uppercase font-bold text-xl">
            Young Israel of Oceanside &bull; Welcome to all our guests!
          </span>
          <span className="italic font-semibold text-xl text-secondary">
            Remember to set your clocks back this weekend.
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-16 flex justify-between items-center bg-[#0a0706] border-t border-primary/10 text-primary/60 font-body text-[10px] tracking-[0.4em] uppercase">
        <div className="w-1/3 flex gap-10 font-bold">
          <span className="hover:text-primary transition-colors cursor-pointer">
            Contact Us
          </span>
          <span className="hover:text-primary transition-colors cursor-pointer">
            Donate
          </span>
          <span className="hover:text-primary transition-colors cursor-pointer">
            Halacha Q&A
          </span>
        </div>
        <div className="w-1/3 text-center opacity-50 font-bold whitespace-nowrap">
          Young Israel of Oceanside | Sponsored by the Levi Family
        </div>
        <div className="w-1/3 flex justify-end">
          <div className="flex items-center gap-3 bg-primary/5 px-6 py-2 border border-primary/20 rounded-sm">
            <span
              className="material-symbols-outlined text-xl gold-inlay"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              church
            </span>
            <span className="text-primary font-black tracking-widest whitespace-nowrap text-xs">
              Sanctuary Mode Active
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
