import axios from 'axios';
import qs from 'qs';

export default async function login(login: string, password: string) {
  const response = await axios.request({
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://is.czu.cz/system/login.pl',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    maxRedirects: 0,
    data: qs.stringify({
      credential_0: login,
      credential_1: password,
      destination: '/auth/?lang=cz',
      auth_2fa_type: 'no',
      auth_id_hidden: '0',
      login_hidden: '1',
      lang: 'cz',
    }),
    validateStatus: (status) => status === 302,
  });
  return new axios.Axios({
    headers: {
      Cookie: response.headers['set-cookie'],
    },
  });
}
