import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

// const API_URL = "http://localhost:5000/api/students";
const API_URL = "https://nadsoft-task.onrender.com/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    subject: "",
    marks: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState(null);

  const getStudents = async () => {
    const res = await axios.get(`${API_URL}?page=${page}&limit=5`);
    setStudents(res.data.data);
    setTotalPages(res.data.pagination.totalPages || 1);
  };

  useEffect(() => {
    getStudents();
  }, [page]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      age: "",
      subject: "",
      marks: "",
    });
    setEditId(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      age: student.age,
      subject: "",
      marks: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await axios.put(`${API_URL}/${editId}`, {
        name: form.name,
        email: form.email,
        age: Number(form.age),
      });

      Swal.fire("Updated!", "Student updated successfully", "success");
    } else {
      await axios.post(API_URL, {
        name: form.name,
        email: form.email,
        age: Number(form.age),
        marks: [
          {
            subject: form.subject,
            marks: Number(form.marks),
          },
        ],
      });

      Swal.fire("Created!", "Student added successfully", "success");
    }

    resetForm();
    getStudents();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "If you delete this Member, then this action can not be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await axios.delete(`${API_URL}/${id}`);
      Swal.fire("Deleted!", "Student deleted successfully", "success");
      getStudents();
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
       <h1 className="mb-3 text-center">STUDENTS DATA</h1>
      <div className="bg-white border rounded shadow-sm p-3">
        <h5 className="mb-3">All Members</h5>

        <div className="row mb-3">
          {/* <div className="col-md-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Qk"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div> */}

          <div className="col-md-12 text-end">
            <button className="btn btn-success btn-sm px-5" onClick={openAddModal}>
              Add New Member
            </button>
          </div>
        </div>

        <table className="table table-bordered table-striped table-sm">
          <thead>
            <tr>
              <th>Id</th>
              <th>Member Name</th>
              <th>Member Email</th>
              <th>Age</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.age}</td>
                <td className="text-center">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(student)}
                  >
                    ✎
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(student.id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center">
          {/* <select className="form-select form-select-sm" style={{ width: "80px" }}>
            <option>5</option>
          </select> */}

          <div>
            <button
              className="btn btn-light btn-sm border me-1"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <button className="btn btn-success btn-sm me-1">{page}</button>

            <button
              className="btn btn-light btn-sm border"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-0">
              <div className="modal-header py-2">
                <h6 className="modal-title">
                  {editId ? "Update Member" : "Add New Member"}
                </h6>

                <button
                  type="button"
                  className="btn-close"
                  onClick={resetForm}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <label className="form-label fw-bold small">Member Name*</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-sm mb-2"
                    placeholder="Enter Member Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  <label className="form-label fw-bold small">Member Email*</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-sm mb-2"
                    placeholder="Enter Member Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />

                  <label className="form-label fw-bold small">Member Age*</label>
                  <input
                    type="number"
                    name="age"
                    className="form-control form-control-sm mb-2"
                    placeholder="Enter Age"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />

                  {!editId && (
                    <>
                      <label className="form-label fw-bold small">
                        Member Subject*
                      </label>
                      <input
                        type="text"
                        name="subject"
                        className="form-control form-control-sm mb-2"
                        placeholder="Enter Subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      />

                      <label className="form-label fw-bold small">
                        Member Marks*
                      </label>
                      <input
                        type="number"
                        name="marks"
                        className="form-control form-control-sm mb-2"
                        placeholder="Enter Marks"
                        value={form.marks}
                        onChange={handleChange}
                        required
                      />
                    </>
                  )}
                </div>

                <div className="modal-footer justify-content-center">
                  <button type="submit" className="btn btn-success btn-sm px-4">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;