import { useState, useEffect } from "react";
import "./style.css";
import eyes from './images/eyes-svg.svg'
import esc from "./images/delete.svg";
import { filterUser } from "../../services/filterFunc";
import AddButton from "../CustomButtons/AddButton/AddButton";
import NothingNot from "../PostList/NothingNot/NothingNot";
import SearchComponent from "../SearchComponent/SearchComponent";
import { addUser, deleteUser, getUsers, updateUser } from "../../services/ApiToServer/users";
import RoleSelector from "../Selectors/RoleSelector/RoleSelector";

/**
 * React component, which creates a platform for control  users.
 * @returns post board
*/
const ControlUsers = ({ ready }) => {

	// State for users list
	const [usersList, setUsersLists] = useState([]);

	// States for new user {email, password}
	const [emailNewUser, setEmailNewUser] = useState("");
	const [passwordNewUser, setPasswordNewUser] = useState("");
	const [role, setRole] = useState('')

	// State for filtered users list.
	const [filteredUsersList, setFilteredUsersLists] = useState([]);

	// State for search item.
	const [searchItem, setSearchItem] = useState("");

	//  State user id for active change.
	const [idActiveuser, setIdActiveuser] = useState(null);

	// State for editing user {email,password}
	const [newEmail, setNewEmail] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newRole, setNewRole] = useState('')

	// Function to query data from a database.
	async function prepareData() {
		const users = await getUsers();
		setUsersLists(users);
		setFilteredUsersLists(users);
	}

	// Function for save update user.
	async function handleSaveUserBtnPress(userId, newEmail, newPassword, countVisit, role, userRole) {
		if (!role) {
			role = userRole;
		}
		const res = await updateUser(userId, newEmail, newPassword, countVisit, role);
		if (!res) return false;
		setIdActiveuser(null);
		setUsersLists(
			usersList.map((user) => {
				return user.id === userId
					? { ...user, email: newEmail, password: newPassword, countVisit: countVisit, role: role }
					: user;
			})
		);

		setFilteredUsersLists(
			filteredUsersList.map((user) => {
				return user.id === userId
					? { ...user, email: newEmail, password: newPassword, countVisit: countVisit, role: role }
					: user;
			})
		);
	}

	// After the page loads, return prepareData()
	useEffect(() => {
		prepareData();
	}, [ready]);

	// Function to record the value, define and modify the filtered list.
	function handleSearch(value) {
		setSearchItem(value);
		setFilteredUsersLists(filterUser(value, usersList));
	}

	// Function for recording a new user
	const RecordingNewUser = (e) => {
		e.preventDefault();
		addUser(emailNewUser, passwordNewUser, role);
		setEmailNewUser("");
		setPasswordNewUser("");
		prepareData();
		setRole('')
	};

	// List with filtered users, if all ok.
	const UsersListOk = () => {
		return filteredUsersList.map((user, index) => (
			<div className="user" key={index}>
				<div
					className="inputs"
					style={{ gap: user.id === idActiveuser ? "10px" : "0" }}
				>
					<input
						className="input"
						value={user.id === idActiveuser ? newEmail : user.email}
						onChange={(e) => setNewEmail(e.target.value)}
						maxLength={25}
						id={user.id + 1}
						name="newEmail"
						type={user.id === idActiveuser ? "text" : "email"}
						disabled={user.id === idActiveuser ? false : true}
						style={{
							border:
								user.id === idActiveuser
									? "1px solid #000"
									: "none",
						}}
					/>
					<input
						className="input inputText"
						value={
							user.id === idActiveuser
								? newPassword
								: user.password
						}
						onChange={(e) => setNewPassword(e.target.value)}
						maxLength={25}
						id={user.id}
						required
						name="newPassword"
						pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$"
						style={{
							border:
								user.id === idActiveuser
									? "1px solid #000"
									: "none",
						}}
						type={user.id === idActiveuser ? "text" : "password"}
						disabled={user.id === idActiveuser ? false : true}
					/>
					<div className="role_block">
						<h3 className={`role ${user.id === idActiveuser ? 'close' : 'open'}`}>
							{user.role}
						</h3>
						<div className={`role_select ${user.id === idActiveuser ? 'open' : 'close'}`}>
							<RoleSelector saveRole={setNewRole} />
						</div>
					</div>

					<div className="buttons">
						<button
							className={`change ${user.id === idActiveuser ? 'close' : 'open'}`}
							onClick={() => {
								setIdActiveuser(user.id);
								setNewEmail(user.email);
								setNewPassword(user.password);
								setNewRole(user.role)
							}}
						>
							Редактировать
						</button>
						<button
							className={`save ${user.id === idActiveuser ? 'open' : 'close'}`}
							onClick={() => {
								handleSaveUserBtnPress(
									user.id,
									newEmail,
									newPassword,
									user.countVisit,
									newRole,
									user.role
								);
							}}
						>
							Сохранить
						</button>
					</div>
					<div className="visitsCount">
						<img className="visit_img" src={eyes} alt="" />
						<p>{user.countVisit}</p>
					</div>
				</div>
				<img
					className="img"
					src={esc}
					onClick={() => {
						deleteUser(user.id);
						prepareData();
					}}
				/>
			</div>
		));
	};

	return (
		<div className="account">
			<div className="newuser">
				<form
					action="submit"
					className="form"
					onSubmit={(e) => RecordingNewUser(e)}
				>
					<div className="subs">
						<h2>Добавление нового пользователя: </h2>

						<div className="sub">
							<span>Email пользователя</span>
							<input
								className="input"
								value={emailNewUser}
								onChange={(e) =>
									setEmailNewUser(e.target.value)
								}
								maxLength={25}
								id="email"
								name="email"
								type="email"
								placeholder="Введите email"
							/>
						</div>
						<div className="sub">
							<span>Пароль пользователя</span>
							<input
								className="input inputLike"
								value={passwordNewUser}
								onChange={(e) =>
									setPasswordNewUser(e.target.value)
								}
								maxLength={25}
								id="password"
								name="password"
								type="text"
								placeholder="Введите пароль"
							/>
						</div>
					</div>
					<div className="buttons_us">
						<RoleSelector role={role} saveRole={setRole} />
						<AddButton text="Добавить" />
					</div>
				</form>
			</div>
			<div className="Main center">
				<SearchComponent searchItem={searchItem} handleSearch={handleSearch} />

				<div className="users">
					{filteredUsersList.length != 0 ? (
						<UsersListOk />
					) : (
						<NothingNot />
					)}
				</div>
			</div>
		</div>
	);
};

export default ControlUsers;
