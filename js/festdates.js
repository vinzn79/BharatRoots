/* Exact festival dates for the live calendar.
   f   = index of the festival card on the Festivals page (0-32), so names follow the page language.
   d   = date (YYYY-MM-DD); e = optional end date for multi-day festivals.
   n   = optional English sub-label for the specific day (e.g. "Holika Dahan").
   s   = source: "gov"  = Government of India holiday list (DoPT O.M. F.No.12/2/2023-JCA:
                          3 July 2025 for 2026, 16 July 2026 for 2027), Delhi/New Delhi offices
                 "pan"  = Drik Panchang (drikpanchang.com), Delhi
                 "rule" = fixed by rule (e.g. second Sunday of May)
   m   = true when the date depends on moon sighting and may move by a day.
   Last checked: 14 November 2026. */
window.FEST_DATES = [
  {f:30, d:"2026-11-14", s:"rule"},
  {f:28, d:"2026-11-15", s:"gov", n:"Evening offering; dawn offering next morning"},
  {f:29, d:"2026-11-24", s:"gov"},
  {f:32, d:"2026-12-01", e:"2026-12-10", s:"rule", n:"Hornbill Festival, Nagaland"},
  {f:31, d:"2026-12-25", s:"gov"},

  {f:0,  d:"2027-01-13", s:"pan", n:"Lohri"},
  {f:0,  d:"2027-01-14", s:"gov", n:"Makar Sankranti / Magh Bihu"},
  {f:0,  d:"2027-01-15", s:"gov", n:"Pongal"},
  {f:1,  d:"2027-01-26", s:"gov"},
  {f:2,  d:"2027-02-11", s:"gov"},
  {f:3,  d:"2027-03-06", s:"gov"},
  {f:7,  d:"2027-03-10", s:"gov", m:true},
  {f:4,  d:"2027-03-22", s:"gov", n:"Holika Dahan"},
  {f:4,  d:"2027-03-23", s:"gov", n:"Holi (colours)"},
  {f:11, d:"2027-03-26", s:"gov", n:"Good Friday"},
  {f:11, d:"2027-03-28", s:"gov", n:"Easter Sunday"},
  {f:6,  d:"2027-04-07", s:"gov"},
  {f:8,  d:"2027-04-14", s:"gov"},
  {f:9,  d:"2027-04-14", s:"gov", n:"Tamil New Year / Vishu"},
  {f:9,  d:"2027-04-15", s:"gov", n:"Pohela Boishakh / Bohag Bihu"},
  {f:5,  d:"2027-04-15", s:"gov"},
  {f:10, d:"2027-04-19", s:"gov"},
  {f:14, d:"2027-05-09", s:"rule"},
  {f:13, d:"2027-05-17", s:"gov", m:true},
  {f:12, d:"2027-05-20", s:"gov"},
  {f:15, d:"2027-06-13", s:"pan"},
  {f:16, d:"2027-07-05", s:"gov"},
  {f:17, d:"2027-07-18", s:"pan"},
  {f:18, d:"2027-08-04", s:"pan"},
  {f:20, d:"2027-08-15", s:"gov"},
  {f:19, d:"2027-08-17", s:"gov"},
  {f:21, d:"2027-08-25", s:"gov", n:"Some families observe 24 August"},
  {f:23, d:"2027-09-04", s:"gov"},
  {f:22, d:"2027-09-12", s:"gov", n:"Thiruvonam"},
  {f:24, d:"2027-09-30", e:"2027-10-08", s:"pan"},
  {f:25, d:"2027-10-06", e:"2027-10-08", s:"gov", n:"Durga Puja: Saptami to Navami"},
  {f:25, d:"2027-10-09", s:"gov", n:"Dussehra / Vijayadashami"},
  {f:26, d:"2027-10-18", s:"gov"},
  {f:27, d:"2027-10-28", s:"gov", n:"Naraka Chaturdashi"},
  {f:27, d:"2027-10-29", s:"gov", n:"Diwali (Lakshmi Puja)"},
  {f:27, d:"2027-10-31", s:"gov", n:"Bhai Dooj"},
  {f:28, d:"2027-11-04", s:"gov"},
  {f:29, d:"2027-11-14", s:"gov"},
  {f:30, d:"2027-11-14", s:"rule"},
  {f:32, d:"2027-12-01", e:"2027-12-10", s:"rule", n:"Hornbill Festival, Nagaland"},
  {f:31, d:"2027-12-25", s:"gov"}
];
