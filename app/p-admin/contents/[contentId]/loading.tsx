const Loading = () => {
  return (
    <section className="mx-auto w-[92%] rounded-[22px] bg-[#ECEEF0] px-6 py-8 max-md:px-4">
      <div className="space-y-5 rounded-[12px] bg-white p-4">
        <div className="h-6 w-1/3 animate-pulse rounded bg-[#D8DEE8]" />
        <div className="h-12 w-1/2 animate-pulse rounded bg-[#D8DEE8]" />
        <div className="h-7 w-full animate-pulse rounded bg-[#D8DEE8]" />
        <div className="h-7 w-full animate-pulse rounded bg-[#D8DEE8]" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-[#D8DEE8]" />
      </div>
    </section>
  );
};

export default Loading;
