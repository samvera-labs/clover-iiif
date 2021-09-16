import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";

const App = (props: { message: string }) => {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => {
    setCount((count) => count + 1);
  }, [count]);

  return (
    <>
      <p>Yo</p>
      <video controls width="900">
        <source
          src="http://docs.evostream.com/sample_content/assets/bun33s.mp4"
          type="video/mp4"
        />
        Sorry, your browser doesn't support embedded videos.
      </video>
    </>
  );
};

ReactDOM.render(<App message="Yo asdfhhh" />, document.getElementById("root"));
