import React, { ChangeEvent, useState, useEffect } from "react";
import { URL_RANDOM_IMG } from "../hooks/yelp-api/index";
import { useDebounce } from "use-debounce/lib";
import { InputType, updateSearchInputsType } from "../interface";
import { Link } from "react-router-dom";

export function Header(props: updateSearchInputsType): JSX.Element {
  const { updateSearchInputs } = props;
  const DEFAULT_VALUE = null;
  const [businessInput, setBusinessInput] = useState<string>("");
  const [whereInput, setWhereInput] = useState<string>("");
  const [business] = useDebounce(businessInput, 500);
  const [where] = useDebounce(whereInput, 500);
  const [searchValues, setSearchValues] = useState<InputType>({
    business: DEFAULT_VALUE,
    where: DEFAULT_VALUE,
  });
  const [urlRandomImg, setUrlRamdomImg] = useState<string | null>(DEFAULT_VALUE);

  const getRandomImg = async (url: string) => {
    const resp = await fetch(url);
    const data = await resp.json();
    return data;
  };

  useEffect(() => {
    Promise.resolve(getRandomImg(URL_RANDOM_IMG))
      .then((resp) => setUrlRamdomImg(resp.urls.full))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setSearchValues({ ...searchValues, business: business });
  }, [business]);

  useEffect(() => {
    setSearchValues({ ...searchValues, where: where });
  }, [where]);

  return (
    <div
      id="header-container"
      style={{
        backgroundImage: `url("${urlRandomImg}")`,
      }}
    >
      <div id="search-container">
        <Link to="/" id="title">
          <h1>Business Finder</h1>
        </Link>
        <div id="input-container">
          <input
            type="text"
            id="business"
            name="business"
            placeholder="Search business..."
            value={businessInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setBusinessInput(e.target.value.toLowerCase())
            }
          />
          <input
            type="text"
            id="where"
            name="where"
            placeholder="Where..."
            value={whereInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWhereInput(e.target.value.toLowerCase())
            }
          />
        </div>
        <button onClick={() => updateSearchInputs(searchValues)}>Search</button>
      </div>
    </div>
  );
}
