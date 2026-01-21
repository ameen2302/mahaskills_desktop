/* eslint-disable react-hooks/rules-of-hooks */
import axios, { AxiosInstance } from "axios";

export class ApiService {
  apiClient: AxiosInstance;
  apiKey: string;
  orgid: string;

  constructor() {
    this.apiKey = localStorage.getItem("apikey") as string;
    this.orgid = localStorage.getItem("orgid") as string;

    this.apiClient = axios.create({
      baseURL: "https://mahaskills-api.edmingle.com/nuSource/api/v1",
      headers: {
        "Content-Type": "application/json",
        orgid: this.orgid,
        apiKey: this.apiKey,
      },
    });
  }

  getAllCourses = async (search: string = "") => {
    if (this.orgid) {
      let url = `/short/masterbatch?status=0&batch_period=3&search=${search}&get_tags=1`;
      return this.apiClient.get(url).then((res) => res.data);
    }
  };

  getBundles = async () => {
    let url = "/bundles";
    return this.apiClient.get(url).then((res) => res.data);
  };

  getCurriculum = async (bundleId: number) => {
    let url = `/tutor/curriculum/${bundleId}`;
    return this.apiClient.get(url).then((res) => res.data);
  };

  getResource = async (materialId: number) => {
    let url = `/tutor/materials/${materialId}`;
    return this.apiClient.get(url).then((res) => res.data);
  };
}
