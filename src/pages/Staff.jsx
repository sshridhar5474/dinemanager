import { useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { staffData } from "../data/staffData";

export default function Staff() {
  const [staff, setStaff] = useLocalStorage("staff", staffData);
  const [roleFilter, setRoleFilter] = useState("All");
  const [attendanceFilter, setAttendanceFilter] = useState("All");

  const rolePills = ["All", "Chef", "Server", "Bartender"];
  const attendancePills = ["All", "Present", "Absent"];

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const roleMatch = roleFilter === "All" || member.role === roleFilter;
      const attendanceMatch =
        attendanceFilter === "All" ||
        (attendanceFilter === "Present" && member.present) ||
        (attendanceFilter === "Absent" && !member.present);

      return roleMatch && attendanceMatch;
    });
  }, [staff, roleFilter, attendanceFilter]);

  const presentCount = staff.filter((member) => member.present).length;
  const absentCount = staff.length - presentCount;
  const chefsPresent = staff.filter(
    (member) => member.role === "Chef" && member.present
  ).length;
  const servicePresent = staff.filter(
    (member) => (member.role === "Server" || member.role === "Bartender") && member.present
  ).length;

  const toggleAttendance = (id) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, present: !member.present } : member
      )
    );
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="section-title">Staff Operations</h2>
        <span>Live attendance for today</span>
      </div>

      <div className="cards">
        <div className="card">
          <p>Total Staff</p>
          <h2>{staff.length}</h2>
        </div>
        <div className="card">
          <p>Present Today</p>
          <h2>{presentCount}</h2>
        </div>
        <div className="card">
          <p>Absent Today</p>
          <h2>{absentCount}</h2>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Attendance Summary</h3>
          <div className="mini-stats">
            <div className="mini-stat">
              <span>Chefs Present</span>
              <strong>{chefsPresent}</strong>
            </div>
            <div className="mini-stat">
              <span>Service Team Present</span>
              <strong>{servicePresent}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Filters</h3>
          <p className="subtle-label">Role</p>
          <div className="pill-group">
            {rolePills.map((pill) => (
              <span
                key={pill}
                className={`pill ${roleFilter === pill ? "active" : ""}`}
                onClick={() => setRoleFilter(pill)}
              >
                {pill}
              </span>
            ))}
          </div>

          <p className="subtle-label">Attendance</p>
          <div className="pill-group">
            {attendancePills.map((pill) => (
              <span
                key={pill}
                className={`pill ${attendanceFilter === pill ? "active" : ""}`}
                onClick={() => setAttendanceFilter(pill)}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card table-card">
        <h3>Team Roster</h3>

        <div className="row header-row staff-row">
          <span>Name</span>
          <span>Role</span>
          <span>Shift</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {filteredStaff.map((member) => (
          <div key={member.id} className="row staff-row">
            <span>{member.name}</span>
            <span>{member.role}</span>
            <span>{member.shift}</span>
            <span className={member.present ? "presence present" : "presence absent"}>
              {member.present ? "Present" : "Absent"}
            </span>
            <button onClick={() => toggleAttendance(member.id)}>
              Mark {member.present ? "Absent" : "Present"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}