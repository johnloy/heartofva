import { meetings } from "../resources/meetings.js";
import { groupBy, kebabCase } from "lodash-es";
import { $, $$, userTime } from "../common.js";
import { html, render } from "lit";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const navEl = document.querySelector(".MeetingsNav");

navEl.addEventListener("keydown", function (e) {
  if (e.key === "Escape") navEl.open = false;
});

const regionsByCounty = [
  [
    "Cville & Albemarle",
    [
      "Charlottesville",
      "Crozet",
      "Earlysville",
      "Greenwood",
      "Keswick",
      "North Garden",
      "Scottsville",
    ],
  ],
  [
    "Green, Madison, & Orange",
    ["Barboursville", "Gordonsville", "Orange", "Ruckersville"],
  ],
  ["Louisa & Fluvana", ["Louisa", "Palmyra", "Scottsville"]],
  ["Nelson & Buckingham", ["Arrington", "Dilwyn", "Lovingston"]],
];

const renderRegionMeetings = (meetingsByLocation, weekday) => {
  const template = html`
    <h2 class="sr-only">Location</h2>
    ${regionsByCounty.map((region) => {
      return html`
        <section>
          <h3>${region[0]}</h3>
          <ul>
            ${region[1].map((location) => {
              const meetingsCount = meetingsByLocation[location]
                ? meetingsByLocation[location].length
                : 0;
              return html`<li data-count=${meetingsCount}>
                ${meetingsCount
                  ? html`<a
                      class="location"
                      href=${`/meetings?weekday=${weekday}&region=${kebabCase(
                        location,
                      )}`}
                      >${location}</a
                    >`
                  : html`<span class="location">${location}</span>`}<span
                  class="badge"
                  >${meetingsCount}</span
                >
              </li>`;
            })}
          </ul>
        </section>
      `;
    })}
  `;
  render(template, $(".locations", navEl));
};

const weekdayFilterFormEl = $(".MeetingsNav .weekday-filter form");

const weekdayFilterInputs = $$('input[type="radio"]', weekdayFilterFormEl);

export const init = async () => {
  const today = userTime().day();

  const meetingsByDay = Object.fromEntries(
    Object.entries(groupBy(await meetings, "day")).map(([day, dayMeetings]) => [
      day,
      groupBy(dayMeetings, "region"),
    ]),
  );

  weekdayFilterInputs[today].checked = true;

  weekdayFilterFormEl.addEventListener("change", (e) => {
    console.log(WEEKDAY_NAMES[e.target.value].toLowerCase());
    renderRegionMeetings(
      meetingsByDay[e.target.value],
      WEEKDAY_NAMES[e.target.value].toLowerCase(),
    );
  });

  renderRegionMeetings(
    meetingsByDay[today],
    WEEKDAY_NAMES[today].toLowerCase(),
  );
};
