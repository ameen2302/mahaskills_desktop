import React, { useEffect, useState } from "react";

type Props = {
  base64Src: string;
};

const AssessmentViewer = ({ base64Src }: Props) => {
  const [html, setHtml] = useState<string>();

  const updateHtml = async (base64Src: string) => {
    try {
      let htmlString = base64Src;
      let parser = new DOMParser();
      htmlString = htmlString.replace(
        "css/style.css",
        "./assessment/style.css"
      );
      htmlString = htmlString.replaceAll("$('#popup')", '$("#popup")');
      htmlString = htmlString.replaceAll(
        '$("#popup").show("slow")',
        'event.preventDefault();$("#popup").show("slow")'
      );
      htmlString = htmlString.replaceAll(
        '$("#popup").hide("slow")',
        'event.preventDefault();$("#popup").hide("slow")'
      );
      htmlString = htmlString.replace(
        "css/style_pages.css",
        "./assessment/style_pages.css"
      );
      htmlString = htmlString.replaceAll(
        "images/clos.png",
        "./assets/clos.png"
      );
      htmlString = htmlString.replaceAll(
        "images/false.png",
        "./assets/false.png"
      );
      htmlString = htmlString.replaceAll(
        "images/true.png",
        "./assets/true.png"
      );
      htmlString = htmlString.replace(
        "js/jquery-1.11.1.js",
        "./assessment/jquery-1.11.1.js"
      );
      // const jqueryRes = await fetch(
      //   "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min.js"
      // );
      // const jquery = await jqueryRes.text();
      // const script = document.createElement("script");
      // script.type = "text/javascript";
      // script.innerText = jquery;
      // document.head.appendChild(script);
      let htmlDoc = parser.parseFromString(htmlString, "text/html");
      let body = htmlDoc.getElementsByTagName("body")[0];
      let scripts = body.getElementsByTagName("script");
      let scriptElement = document.createElement("script");
      scriptElement.type = "text/javascript";
      // htmlString = htmlString.replaceAll(
      //   /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      //   ""
      // );
      for (let i = 0; i < scripts.length; i++) {
        let script = scripts[i].innerHTML;
        scriptElement.text += script;
      }
      document.head.appendChild(scriptElement);
      setHtml(htmlString);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    updateHtml(base64Src);
  }, [base64Src]);

  return (
    <div
      style={{
        height: window.innerWidth < 1920 ? "100%" : "calc(100% - 105px)",
      }}
    >
      <iframe srcDoc={html} title="assessment" height="100%" width="100%" />
    </div>
  );
};
export default AssessmentViewer;
