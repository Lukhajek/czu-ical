import { Router } from 'express';
import login from '../lib/login';
import { z } from 'zod';
export const calendarRouter = Router();
import qs from 'qs';
import { JSDOM } from 'jsdom';

const schema = z.object({
  login: z.string(),
  password: z.string(),
});

function getParamFromUrl(url: string, name: string) {
  const queryPart = url.split('?').slice(1).join('?');
  const normalized = queryPart.replace(/[?;,]+/g, '&');
  const usp = new URLSearchParams(normalized);
  return usp.get(name);
}

const VTIMEZONE_PRAGUE = `BEGIN:VTIMEZONE
TZID:Europe/Prague
X-LIC-LOCATION:Europe/Prague
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;

function insertVTimezoneAfterBeginCalendar(content: string, eol: string) {
  const re = /^BEGIN:VCALENDAR([ \t]*)(\r\n|\n)/im;
  if (re.test(content)) {
    return content.replace(re, (m, p1, nl) => {
      return `BEGIN:VCALENDAR${p1}${nl}${VTIMEZONE_PRAGUE.replace(
        /\n/g,
        eol,
      )}${eol}`;
    });
  } else {
    return `${VTIMEZONE_PRAGUE.replace(/\n/g, eol)}${eol}${content}`;
  }
}

function transformToPrague(content: string) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  let out = content;

  out = out.replace(/TZID=floating/gi, 'TZID=Europe/Prague');

  const hasPragueVtimezone =
    /BEGIN:VTIMEZONE[\s\S]*?TZID:Europe\/Prague[\s\S]*?END:VTIMEZONE/i.test(
      out,
    );

  if (!hasPragueVtimezone) {
    out = insertVTimezoneAfterBeginCalendar(out, eol);
  }

  return out;
}

calendarRouter.get('/my.ical', async (req, res) => {
  let loginName: string, password: string;
  try {
    ({ login: loginName, password } = schema.parse(req.query));
  } catch {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  const axiosInstance = await login(loginName, password);

  const studyPageResponse = await axiosInstance.request({
    method: 'get',
    url: 'https://is.czu.cz/auth/student/moje_studium.pl',
  });

  const dom = new JSDOM(studyPageResponse.data);
  const doc = dom.window.document;
  const timeTableUrl = doc
    ?.querySelector("a:has(span[data-sysid='studevid-osobni-rozvrh'])")
    ?.getAttribute('href');

  if (!timeTableUrl) {
    throw new Error('Time table URL not found');
  }

  const timeTableId = getParamFromUrl(timeTableUrl, 'rozvrh_student');

  if (!timeTableId) {
    throw new Error('Time table ID not found');
  }

  const timeTableResponse = await axiosInstance.request({
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://is.czu.cz/auth/katalog/rozvrhy_view.pl',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    maxRedirects: 0,
    data: qs.stringify({
      lang: 'cz',
      rozvrh_student: timeTableId,
      rezervace: '0',
      poznamky_zmeny: '1',
      poznamky_parovani: '1',
      poznamky_dalsi_ucit: '1',
      poznamky_jiny_areal: '1',
      typ_vypisu: 'konani',
      konani_od: '1. 1. 2000',
      konani_do: '31. 12. 2050',
      format: 'ics',
      nezvol_all: '2',
      poznamky: '1',
      poznamky_base: '1',
      poznamky_dl_omez: '1',
      zobraz: '1',
      zobraz2: 'Zobrazit',
    }),
  });

  res.send(transformToPrague(timeTableResponse.data));
});
