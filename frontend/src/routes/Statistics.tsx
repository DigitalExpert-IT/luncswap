import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { addDays } from "date-fns";
import * as d3 from "d3";

let d = new Date();
const randomizer = d3.randomUniform(100);
let prevVal = 1;
const data = new Array(4).fill(null).map(() => {
  d = addDays(d, 1);
  prevVal += randomizer();
  return {
    val: prevVal,
    timestamp: d,
  };
});

export default function Statistics() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boxRef.current) return;
    render(boxRef.current);
  });

  return <Box ref={boxRef} w="full" aspectRatio={640 / 400} />;
}

const render = (box: HTMLDivElement) => {
  const width = box.clientWidth;
  const height = box.clientHeight;
  const marginTop = 16;
  const marginRight = 16;
  const marginBottom = 16;
  const marginLeft = 16;

  // Declare the x (horizontal position) scale.
  const x = d3.scaleUtc(d3.extent(data, d => d.timestamp) as [Date, Date], [
    marginLeft,
    width - marginRight,
  ]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear(
    [0, d3.max(data, d => d.val)!],
    [height - marginBottom, marginTop],
  );

  // Declare the line generator.
  const line = d3
    .line<{ timestamp: Date; val: number }>()
    .x(d => x(d.timestamp))
    .y(d => y(d.val));

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  // Add the x-axis.
  svg.append("g").attr("transform", `translate(0,${height - marginBottom})`);

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(g => g.select(".domain").remove())
    .call(g =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1),
    )
    .call(g => g.append("text").attr("x", -marginLeft).attr("y", 10));

  // Append a path for the line.
  svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#e1b011")
    .attr("stroke-width", 3)
    .attr("d", line(data));

  // Return the SVG element.
  const svgNode = svg.node();
  if (svgNode) {
    box.innerHTML = "";
    box.appendChild(svgNode);
  }
};
