import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme='dark'
      className='toaster group'
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group toast frame text-card-foreground shadow-lg p-4 flex items-center gap-2 text-sm',
          content: 'flex flex-col gap-1',
          title: 'text-sm font-medium leading-none',
          description: 'text-xs text-muted-foreground',
          actionButton: 'ml-auto h-6 px-2 text-xs font-medium bg-primary text-primary-foreground',
          cancelButton: 'h-6 px-2 text-xs font-medium bg-muted text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
