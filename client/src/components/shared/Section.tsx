export const Section = ({ title, children }: any) => {
  return (
    <div className="border border-gray-200 bg-white rounded-xl p-4">
      <h3 className="text-xl font-semibold text-gray-900 font-manrope mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
};
