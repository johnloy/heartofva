import { register as registerSwiper } from "swiper/element/bundle";
import { Navigation, Pagination } from "swiper/modules";
import { meetings } from "./resources/meetings.js";
import { $, $$, userTime, MEETING_TYPES } from "./common.js";
import { html, render } from "lit";
import day from "dayjs";

const MeetingUrgency = {
  PAST: "past",
  NOW: "now",
  NEXT: "next",
  SOON: "soon",
};

const renderMeeting = (meeting) => {
  const urgency = meeting.isHappening
    ? MeetingUrgency.NOW
    : meeting.isNext
    ? MeetingUrgency.NEXT
    : meeting.isPast
    ? MeetingUrgency.PAST
    : MeetingUrgency.SOON;

  const urgencyLabels = {
    [MeetingUrgency.PAST]: "",
    [MeetingUrgency.NOW]: "Now",
    [MeetingUrgency.NEXT]: "Up Next",
  };

  const urgencyLabel = urgencyLabels[urgency];
  // meeting.isHappening
  // ? "Now"
  // : meeting.isNext
  // ? "Up Next"
  // : "";
  const template = html`
    <swiper-slide class="meeting" data-urgency=${urgency}>
      <article>
        <header>
          <h3 itemprop="name">${meeting.name}</h3>
        </header>
        <p class="time">
          <time itemprop="startDate" datetime="2023-07-22T10:00"
            >${meeting.time}</time
          >
          ${urgencyLabel
            ? html`(&thinsp;<span class="urgency">${urgencyLabel}</span
                >&thinsp;)`
            : ""}
        </p>
        ${meeting.isOnlineOnly
          ? html`Online`
          : html`
              <address itemprop="location" itemtype="http://schema.org/Place">
                <span itemprop="name"><strong>${meeting.location}</strong></span
                ><br />
                <span itemprop="street-address">${meeting.streetAddress}</span
                ><br />
                <span itemprop="city">${meeting.city}</span>,
                <span itemprop="state">${meeting.state}</span>
                <span itemprop="zip">${meeting.zip}</span>
              </address>
            `}
        <div itemprop="description">
          <ul>
            ${meeting.types.map((type) => html`<li>${type}</li>`)}
          </ul>
          <p>
            A speaker will discuss one of the steps (15 mins) followed by group
            participation.
          </p>
        </div>
      </article>
    </swiper-slide>
  `;
  const renderRoot = document.createDocumentFragment();
  render(template, renderRoot);
  return renderRoot;
};

const parseAddressParts = (formattedAddress) => {
  let remainingStr = formattedAddress
    .replace(/, ?USA$/i, "")
    .replace(/ VA\b/, "");
  const cityZipMatch = /, ?(?<city>[^,]+) ?, ?(?<zip>[0-9-]+)$/.exec(
    remainingStr,
  );

  const { city, zip } = cityZipMatch?.groups ?? {};

  const streetAddress = remainingStr.substring(
    0,
    cityZipMatch?.index ?? remainingStr.length,
  );

  return {
    streetAddress: streetAddress,
    city: city,
    zip: zip,
  };
};

const prepareMeetingData = (meeting) => {
  const { streetAddress, city, zip } = parseAddressParts(
    meeting.formatted_address,
  );

  const types = [meeting.types?.includes("C") ? "Open" : "Closed"];
  if (meeting.types?.includes("ONL")) {
    types.push("Online");
  }

  for (const typeCode of meeting.types ?? []) {
    if (!["O", "C", "ONL"].includes(typeCode)) {
      types.push(MEETING_TYPES[typeCode]);
    }
  }

  return {
    name: meeting.name,
    location: meeting.location,
    time: meeting.time_formatted.replace(/am|pm/i, (s) => s.toUpperCase()),
    streetAddress: streetAddress,
    city: city,
    state: "VA",
    zip: zip,
    isOnlineOnly: !city && meeting.types?.includes("ONL"),
    isHappening: !!meeting.isHappening,
    isPast: !!meeting.isPast,
    isNext: !!meeting.isNext,
    types,
  };
};

export const init = async () => {
  registerSwiper();

  const meetingsSoonData = (await meetings)
    .filter((meeting) => meeting.day === userTime().day())
    .sort((a, b) => (a.time < a.b ? -1 : a.time > a.b ? 1 : 0))
    .reduce((accum, meeting) => {
      const newMeetingData = { ...meeting };
      const [hh, mm] = meeting.time.trim().split(":");
      const meetingTime = userTime().clone().hour(hh).minute(mm);
      const diff = meetingTime.diff(userTime(), "minute");
      const isPast = diff < 0;
      const isHappening = isPast && Math.abs(diff) < 50;

      if (isHappening) {
        newMeetingData.isHappening = true;
      } else if (isPast) {
        newMeetingData.isPast = true;
      }

      accum.push(newMeetingData);

      return accum;
    }, []);

  const firstNowMeetingIndex = meetingsSoonData.findIndex(
    (meeting) => meeting.isHappening,
  );

  const nextMeetingIndex = meetingsSoonData.findIndex(
    (meeting) => !meeting.isPast && !meeting.isHappening,
  );
  meetingsSoonData[nextMeetingIndex].isNext = true;

  const activeIndex = Number.isInteger(firstNowMeetingIndex)
    ? firstNowMeetingIndex
    : nextMeetingIndex;

  const swiperEl = $("#meetings-soon swiper-container");
  const swiperInstance = $("#meetings-soon swiper-container").swiper;
  console.log(activeIndex);

  // console.log(swiperEl);
  meetingsSoonData.forEach((meeting, i) => {
    const meetingData = prepareMeetingData(meeting);
    swiperInstance.appendSlide(renderMeeting(meetingData));
  });

  swiperInstance.slideTo(activeIndex, 0);

  // console.log(meetingsSoonData);
};
