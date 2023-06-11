import { useMemo } from "react";
import {
  withStyles,
  Appear,
  Link,
  Paragraph,
  Table,
  Words,
} from "arwes";

import Clickable from "../components/Clickable";

const styles = () => ({
  link: {
    color: '#FF0000',
		WebkitTextFillColor: '#FF0000',
		WebkitOpacity: 1,
    textDecoration: "none",
  },
	linkDisabled: {
		color: "#808080",
		WebkitTextFillColor: '#808080',
		WebkitOpacity: 1,
		textDecoration: "none",
		cursor: "not-allowed"
	}
});

const Upcoming = props => {
  const {
    entered,
    launches,
    classes,
    abortLaunch,
  } = props;

  const tableBody = useMemo(() => {
    return launches?.filter((launch) => launch.upcoming)
      .map((launch) => {
        return <tr key={String(launch.flightNumber)}>
          <td>
            <Clickable style={{color: "red"}}>
              <Link className={launch.customers[0] === 'You' ? classes.link : classes.linkDisabled} onClick={() => {
									// console.log('launch data: ', launch.customers[0] === 'You')
									if (launch.customers[0] === 'You') {
										abortLaunch(launch.flightNumber)
									}
								}
							}>
                ✖
              </Link>
            </Clickable>
          </td>
          <td>{launch.flightNumber}</td>
          <td>{new Date(launch.launchDate).toDateString()}</td>
          <td>{launch.mission}</td>
          <td>{launch.rocket}</td>
          <td>{launch.target}</td>
        </tr>;
      });
  }, [launches, abortLaunch, classes.link]);

  return <Appear id="upcoming" animate show={entered}>
    <Paragraph>Upcoming missions including both SpaceX launches and your newly scheduled rockets.</Paragraph>
    <Words animate>Warning! Clicking on the ✖ aborts the mission (you can delete only yours).</Words>
    <Table animate show={entered}>
      <table style={{tableLayout: "fixed"}}>
        <thead>
          <tr>
            <th style={{width: "3rem"}}></th>
            <th style={{width: "3rem"}}>No.</th>
            <th style={{width: "10rem"}}>Date</th>
            <th style={{width: "11rem"}}>Mission</th>
            <th style={{width: "11rem"}}>Rocket</th>
            <th>Destination</th>
          </tr>
        </thead>
        <tbody>
          {tableBody}
        </tbody>
      </table>
    </Table>
  </Appear>;
}

export default withStyles(styles)(Upcoming);
