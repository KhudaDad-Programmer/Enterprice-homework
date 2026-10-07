import { useEffect, useState } from "react";
import { getCourses } from "../services/courseApi";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchCourses() {
      try {
        const response = await getCourses();
        if (!ignore) {
          setCourses(response.data);
        }
      } catch (requestError) {
        console.error("Error loading courses:", requestError);
        if (!ignore) {
          setError("Unable to load courses. Check the backend and try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchCourses();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section>
      <h2 className="mb-2">Course Management</h2>

      {loading && <p>Loading courses…</p>}
      {!loading && error && <p className="text-danger">{error}</p>}
      {!loading && !error && courses.length === 0 && <p>No courses available.</p>}

      {!loading && !error && courses.length > 0 && (
        <>
          <p className="text-muted">Total courses: {courses.length}</p>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.code}</td>
                    <td>{course.title}</td>
                    <td>{course.credits}</td>
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
