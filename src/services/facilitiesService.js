import Facility from "../models/FacilityModel.js";

export async function listFacilitiesService(filter = {}, options = {}) {
  return Facility.find(filter, null, options).sort({ title: 1 });
}

export async function getFacilityByIdService(id) {
  return Facility.findById(id);
}

export async function createFacilityService(payload) {
  return Facility.create(payload);
}

export async function updateFacilityService(id, payload) {
  return Facility.findByIdAndUpdate(id, payload, { new: true });
}

export async function deleteFacilityService(id) {
  return Facility.findByIdAndDelete(id);
}
