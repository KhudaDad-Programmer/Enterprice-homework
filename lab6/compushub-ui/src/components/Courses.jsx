import { useCallback, useEffect, useState } from "react";
import { deleteCourse, getCourses, updateCourse } from "../services/courseApi";

const emptyCourse = { code: "", title: "", credits: "" };

function getErrorMessage(error, fallback) {
  const responseMessage = error.response?.data?.message;
  return typeof responseMessage === "string" && responseMessage.trim()
    ? responseMessage
    : fallback;
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [course, setCourse] = useState(emptyCourse);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    const response = await getCourses();
    if (!Array.isArray(response.data)) {
      throw new Error("The courses endpoint did not return a list.");
    }
    setCourses(response.data);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchCourses() {
      try {
        const response = await getCourses();
        if (!Array.isArray(response.data)) {
          throw new Error("The courses endpoint did not return a list.");
        }
        if (active) setCourses(response.data);
      } catch (requestError) {
        console.error("Error loading courses:", requestError);
        if (active) {
          setError(getErrorMessage(requestError, "Unable to load courses. Check that the backend is running."));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchCourses();
    return () => {
      active = false;
    };
  }, []);

  function handleEdit(selectedCourse) {
    setEditingId(selectedCourse.id);
    setCourse({
      code: String(selectedCourse.code ?? ""),
      title: String(selectedCourse.title ?? ""),
      credits: String(selectedCourse.credits ?? ""),
    });
    setMessage("");
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setCourse((previous) => ({ ...previous, [name]: value }));
  }

  function cancelEdit() {
    setEditingId(null);
    setCourse(emptyCourse);
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const updatedCourse = {
      code: String(course.code ?? "").trim(),
      title: String(course.title ?? "").trim(),
      credits: Number(course.credits),
    };

    try {
      await updateCourse(editingId, updatedCourse);
      await loadCourses();
      cancelEdit();
      setMessage("Course updated successfully.");
    } catch (requestError) {
      console.error("Error updating course:", requestError);
      setError(getErrorMessage(requestError, "Failed to update course. Check the API response."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this course?")) return;

    setDeletingId(id);
    setMessage("");
    setError("");
    try {
      await deleteCourse(id);
      await loadCourses();
      if (editingId === id) cancelEdit();
      setMessage("Course deleted successfully.");
    } catch (requestError) {
      console.error("Error deleting course:", requestError);
      setError(getErrorMessage(requestError, "Failed to delete course. Check the API response."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="container mt-4">
      <h2 className="text-center mb-4">Course Management</h2>

      {message && <div className="alert alert-success" role="status">{message}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {editingId !== null && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-warning">
            <strong>Edit Course</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label" htmlFor="course-code">Course Code</label>
                  <input
                    id="course-code"
                    type="text"
                    name="code"
                    className="form-control"
                    value={course.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label" htmlFor="course-title">Course Title</label>
                  <input
                    id="course-title"
                    type="text"
                    name="title"
                    className="form-control"
                    value={course.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label" htmlFor="course-credits">Credits</label>
                  <input
                    id="course-credits"
                    type="number"
                    name="credits"
                    min="1"
                    step="1"
                    className="form-control"
                    value={course.credits}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-success w-100" disabled={saving}>
                    {saving ? "Updating…" : "Update"}
                  </button>
                </div>
              </div>
              <button type="button" className="btn btn-secondary mt-3" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p role="status">Loading courses…</p>
      ) : courses.length === 0 ? (
        !error && <p>No courses available.</p>
      ) : (
        <>
          <p className="text-muted">Total courses: {courses.length}</p>
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Code</th>
                  <th scope="col">Title</th>
                  <th scope="col">Credits</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{String(item.code ?? "")}</td>
                    <td>{String(item.title ?? "")}</td>
                    <td>{item.credits}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(item)}
                        disabled={deletingId !== null || saving}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId !== null || saving}
                      >
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
