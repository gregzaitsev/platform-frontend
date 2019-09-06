export const NeverComponent = (name:string) => props =>
  {
    console.log("error:",props);
    throw(`${name}: this shouldn't have happened!`)
  };
