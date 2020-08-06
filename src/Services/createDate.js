const createDate = (string) => {
  const backToDate = JSON.parse(string);
  const realDate = new Date(backToDate);
  console.log(realDate, "this is real date");
  const month = realDate.getMonth() + 1;
  const date = realDate.getDate();
  const year = realDate.getFullYear();
  const finalDate =
    JSON.stringify(month) +
    "/" +
    JSON.stringify(date) +
    "/" +
    JSON.stringify(year);

  return finalDate;
};

module.exports = createDate;
