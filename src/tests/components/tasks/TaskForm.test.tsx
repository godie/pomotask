import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Dialog } from "@/components/ui/Dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

describe("TaskForm", () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    title: "New Task",
  };

  const renderForm = (props = mockProps) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Dialog open={true}>
            <TaskForm {...props} />
        </Dialog>
      </QueryClientProvider>
    );
  };

  it("renders all form fields", () => {
    renderForm();
    expect(screen.getByLabelText(/Task Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimation/i)).toBeInTheDocument();
  });

  it("calls onSubmit with form values", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: '1' });
    renderForm({ ...mockProps, onSubmit });

    fireEvent.change(screen.getByLabelText(/Task Name/i), {
      target: { value: "New Task" },
    });

    fireEvent.click(screen.getByText(/Add Task/i));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: "New Task",
        projectId: null,
        estimatedPomodoros: 1,
      }));
    });
  });

  it("validates name max length (60 chars)", async () => {
    renderForm();
    const nameInput = screen.getByLabelText(/Task Name/i);
    const longName = "a".repeat(61);

    fireEvent.change(nameInput, { target: { value: longName } });
    fireEvent.click(screen.getByText(/Add Task/i));

    await waitFor(() => {
        expect(screen.getByText(/Name must be 60 characters or less/i)).toBeInTheDocument();
    });
  });

  it("shows split dialog when estimate > 5", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: '1', name: 'Big Task', estimatedPomodoros: 6 });
    renderForm({ ...mockProps, onSubmit });

    fireEvent.change(screen.getByLabelText(/Task Name/i), {
        target: { value: "Big Task" },
    });

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '6' } });

    fireEvent.click(screen.getByText(/Add Task/i));

    // Wait for the TaskSplitDialog content to appear
    await waitFor(() => {
        expect(screen.getByText(/Keep as one task/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
