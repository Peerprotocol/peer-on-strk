const ProfilecardLoader = () => (
    <div className="border border-gray-200 rounded-[1rem] flex flex-col gap-6 md:p-6 p-2 bg-white w-full">
      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 3xl:gap-[2rem] w-full">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="border border-gray-200 p-6 rounded-xl mt-4 bg-smoke-white relative flex flex-col justify-center w-full lg:w-[calc(51%-1rem)] 3xl:w-[48%]"
          >
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse mb-8"></div>
            
            <div className="absolute top-2 right-3 w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );

  export default ProfilecardLoader;