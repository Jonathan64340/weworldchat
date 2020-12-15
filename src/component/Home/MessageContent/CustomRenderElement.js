import React from 'react';

/**
 * 
 * @param {String} String
 * @description - Can return simple string or string with regex for parsing url 
 */
const CustomRenderElement = ({ string }) => {
    const regex = new RegExp(/\b(https?|ftp|file):\/\/[A-Za-z0-9+&@#%?=~_|!:,.;]*[A-Za-z0-9+&@#%=~_|]/g)
    const str = string.match(regex)
    if (str instanceof Array) {
        let tmpString = [];
        for(let i = 0; i < str.length; i++) {
            tmpString.push(string.replace(str[i], `<a class="link-message" href=${str[i]} target="_blank" rel="noopener noreferrer">${str[i]}</a>`))
        }

        for(let i = 0; i < tmpString.length; i++) {
            return <div dangerouslySetInnerHTML={{
                __html: tmpString[i]
            }}></div>
        }
    }

    return <>{string}</>

}

export default CustomRenderElement;