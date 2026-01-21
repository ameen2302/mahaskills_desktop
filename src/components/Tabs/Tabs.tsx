import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface TabsProps {
  items: {
    indexAt?: number;
    title: string;
    children?: { title: string; indexAt: number }[];
  }[];
  onChange: (indexAt: number) => void;
  activeTabIndex?: number;
}
const Tabs: React.FC<TabsProps> = ({ activeTabIndex, items, onChange }) => {
  const [selectedTab, setSelectedTab] = useState<number>(activeTabIndex || 0);
  const [selectedChildTab, setSelectedChildTab] = useState<number>(-1);
  const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

  const params: { bundleId: string; lessonId: string; materialId: string } =
    useParams();

  useEffect(() => {
    setSelectedTab(0);
    setSelectedChildTab(-1);
    setIsDropDownOpen(false);
  }, [params.materialId]);
  return (
    <div className="w-full flex gap-1 py-px">
      {items?.map((item, index) => (
        <div
          key={index}
          onClick={() => {
            if (item?.indexAt !== undefined) {
              setSelectedTab(index);
              onChange(item?.indexAt);
            } else if (item?.children?.length === 1) {
              setSelectedTab(index);
              onChange(item?.children?.[0]?.indexAt);
            }
            if (!item?.children || item?.children?.length === 1) {
              setSelectedChildTab(-1);
              setIsDropDownOpen(false);
            } else {
              setIsDropDownOpen((prev) => !prev);
            }
          }}
          className={`tab-text relative flex items-center justify-around ${
            selectedTab === index ? "bg-orange" : "bg-dark-blue"
          }`}
        >
          <p className={`m-0 py-2`}>{item.title}</p>
          {item?.children && item?.children?.length > 1 && (
            <div
              className={`h-full flex items-center pl-2.5
              ${selectedTab === index ? "bg-orange" : "bg-dark-blue"}
              `}
              style={{ borderLeft: "1px solid white" }}
            >
              <img
                src={require("../../assets/arrow_down.svg").default}
                alt="drop down"
                width={14}
                className={`${
                  isDropDownOpen ? "rotate-180 transition-transform" : ""
                }`}
              />
            </div>
          )}
          {item?.children && item.children.length > 1 && isDropDownOpen && (
            <>
              <div className="absolute top-full flex flex-col w-full my-px z-20">
                {item?.children?.map((child, idx) => (
                  <span
                    className={`tab-text py-2 mb-px ${
                      selectedChildTab === idx ? "bg-orange" : "bg-dark-blue"
                    }`}
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(child.indexAt);
                      setSelectedTab(index);
                      setSelectedChildTab(idx);
                      setIsDropDownOpen(false);
                    }}
                  >
                    {child?.title}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
