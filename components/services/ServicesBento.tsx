import { BookingTile, DashboardTile, FrontDeskTile, PosTile, StaffingTile, VideoTile } from './tiles';

// "What we do" as six small working pieces of what we build. Everything runs in
// the visitor's browser: no outside requests, no AI calls.
export default function ServicesBento() {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-head split">
          <div>
            <div className="kicker">01 / WHAT WE DO</div>
            <h2 className="h2">Don&apos;t read about it. Click it.</h2>
          </div>
          <p className="section-aside">Every tile below is a small working piece of something we build. Go ahead and use them.</p>
        </div>
        <div className="tw:grid tw:gap-4 tw:md:grid-cols-2 tw:lg:grid-cols-3 tw:lg:gap-5">
          <BookingTile className="tw:lg:col-span-2" />
          <PosTile className="tw:md:row-span-2" />
          <FrontDeskTile />
          <DashboardTile />
          <StaffingTile />
          <VideoTile className="tw:md:col-span-2 tw:lg:col-span-2" />
        </div>
      </div>
    </section>
  );
}
