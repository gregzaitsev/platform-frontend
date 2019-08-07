// Its possible for link to be undefined if user removed link prop from URL
export const isValidLink = (link: string | undefined) =>
  link &&
  /^https?:\/\/(neufund\.(org|net|io)|localhost:\d+)\/api\/newsletter\/subscriptions\/\w+\/topics\/\w+$/.test(
    link,
  );
