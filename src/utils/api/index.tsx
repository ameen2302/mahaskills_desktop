// import { AuthCollection, AuthEndpoints } from "./collections/auth";
// import { CourseCollection, CourseEndpoints } from "./collections/course";

// export type Endpoint = AuthEndpoints | CourseEndpoints;

const path: string = "https://mahaskills-api.edmingle.com/nuSource/api/v1";

// type EndpointCollection = { [key in Endpoint]?: string };

// const include = (collection: { PATH: string; ENDPOINTS: EndpointCollection }) =>
//   Object.fromEntries(
//     Object.keys(collection.ENDPOINTS).map((k) => [
//       k,
//       collection.PATH + collection.ENDPOINTS[k as Endpoint],
//     ])
//   ) as EndpointCollection;

// const LEARNENGG_ENDPOINTS: EndpointCollection = [
//   AuthCollection,
//   CourseCollection,
// ].reduce((z, c) => Object.assign(z, include(c)), {});

export const getApiEndpoint: () => string = () =>
  // endpoint: Endpoint
  {
    // if (endpoint in LEARNENGG_ENDPOINTS) {
    return `${path}`;
    // ${LEARNENGG_ENDPOINTS[endpoint]}`;
    // } else return "";
  };
