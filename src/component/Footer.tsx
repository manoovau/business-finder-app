import React from "react";

export const Footer = (): JSX.Element => {
  return (
    <div
      id="footer-container"
      className="text-[0.55rem] flex flex-col items-center p-6 bg-gray-500 text-white sm:text-[1rem]"
    >
      <div>
        Icons made by{` `}
        <a href="https://www.flaticon.com/authors/payungkead" title="Payungkead">
          Payungkead
        </a>
        ,{` `}
        <a href="https://www.flaticon.com/authors/twentyfour" title="twentyfour">
          twentyfour
        </a>
        {` `}
        and{` `}
        <a href="https://www.freepik.com" title="Freepik">
          Freepik
        </a>
        {` `}from{` `}
        <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>
      </div>
    </div>
  );
};
