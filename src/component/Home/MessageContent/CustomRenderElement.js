import React from "react";
import reactStringReplace from "react-string-replace";

/**
 *
 * @param {String} String
 * @description - Can return simple string or string with regex for parsing url
 */
const CustomRenderElement = ({ string }) => {
  const regex = new RegExp(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g
  );

  return reactStringReplace(string, regex, (match, i, offset) => {
    return <a className="link-message" href={match} rel="noopener noreferrer" target="_blank">{match}</a>;
  });
};

export default CustomRenderElement;
