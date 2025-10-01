import { Router } from 'express';
import login from '../lib/login';
import { z } from 'zod';
export const calendarRouter = Router();
import qs from 'qs';
import { JSDOM } from 'jsdom';
import ical from 'node-ical';
import * as ics from 'ics';
import moment from 'moment';

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

  const transformedTimeTable = ical.parseICS(timeTableResponse.data);

  const events = Object.values(transformedTimeTable).filter(
    (event) => event.type === 'VEVENT',
  );

  const { error, value } = ics.createEvents(
    events.map((event) => ({
      title: event.summary,
      uid: event.uid,
      description: event.description,
      location: event.location,
      start: moment(event.start)
        .format('YYYY-M-D-H-m')
        .split('-')
        .map((a) => parseInt(a)) as [number, number, number, number, number],
      startInputType: 'local',
      startOutputType: 'utc',
      end: moment(event.end)
        .format('YYYY-M-D-H-m')
        .split('-')
        .map((a) => parseInt(a)) as [number, number, number, number, number],
      endInputType: 'local',
      endOutputType: 'utc',
    })),
    {
      calName: 'CZU Time table',
      productId: 'CZU Time table',
      method: 'PUBLISH',
    },
  );

  if (error) {
    console.dir(error);
    throw error;
  }

  console.log(
    `${new Date().toISOString()} - Time table endpoint returned ${
      value?.length
    } characters for ${loginName}`,
  );
  res.send(value);
});
