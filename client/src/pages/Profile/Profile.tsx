import maleAvatar from "../../assets/male-avatar.jpg";
import femaleAvatar from "../../assets/female-avatar.jpg";
import { ButtonComp, InputField } from "../../components";

export default function Profile() {
  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-semibold text-lightText dark:text-darkText">
        Profile
      </h2>
      <div className="mt-8">
        <div className="mx-auto w-40 h-40 rounded-full overflow-clip">
          <img src={maleAvatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="w-1/2 flex flex-col gap-4 mt-4 mx-auto">
          <InputField label="Username" placeholder="Enter Username" />
          <InputField label="About" placeholder="Enter About" />
        </div>
        <ButtonComp label="Update" className="mt-6 w-32 py-2 mx-auto block" />
      </div>
    </div>
  );
}
