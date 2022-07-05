import got from 'got'


async function main() {
  const authResponse = await got.post(
    'http://35.207.169.147/auth',
    {
      json: {
        email: 'helgi.kristjansson@gmail.com',
        password: 'lTgAYaLP9jRs'
      }
    }
  ).json()
  console.log(authResponse)
  const token = authResponse.token
  const eventResponse = await got.get(
    'http://35.207.169.147/results',
    {
      headers: {
        authorization: `Bearer ${token}`
      }
    }
  ).json()
  return eventResponse
}

main()
  .then(data => {
    console.log(data)
  })
  .catch(e => {
    console.error(e)
  })
