import Application from "../models/Application.js";

export const createApplication = async (req, res) => {
  const app = await Application.create(req.body);
  res.json(app);
};

export const getMyApplication = async (req, res) => {
  const app = await Application.findOne({ facultyId: req.params.id });
  res.json(app);
};

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("UPDATE ID:", id);

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid application ID" });
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after" }
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// ✅ GET ALL APPLICATIONS (ADMIN)
export const getAllApplications = async (req, res) => {
  const apps = await Application.find();
  res.json(apps);
};

// ✅ UPDATE STATUS (APPROVE / REJECT)
export const updateStatus = async (req, res) => {
  const { status } = req.body;

  const updated = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    { returnDocument: "after" }
  );

  res.json(updated);
};

// ✅ GET SINGLE APPLICATION BY ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;


    const app = await Application.findById(id);

    console.log("FOUND DATA:", app);

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};