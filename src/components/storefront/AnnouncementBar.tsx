type Props = {
  text: string;
};

export function AnnouncementBar({ text }: Props) {
  return (
    <div className="mm-announce" role="status">
      {text}
    </div>
  );
}
