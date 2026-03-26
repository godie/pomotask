import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Dialog } from "@/components/ui/Dialog";

describe("ProjectForm", () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    title: "New Project",
  };

  const renderForm = (props = mockProps) => {
    return render(
      <Dialog open={true}>
        <ProjectForm {...props} />
      </Dialog>
    );
  };

  it("renders all form fields", () => {
    renderForm();
    expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Brand Color/i)).toBeInTheDocument();
  });

  it("calls onSubmit with form values", async () => {
    const onSubmit = vi.fn();
    renderForm({ ...mockProps, onSubmit });

    fireEvent.change(screen.getByLabelText(/Project Name/i), {
      target: { value: "New Project" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "New Description" },
    });

    fireEvent.click(screen.getByText(/Save Project/i));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "New Project",
        description: "New Description",
        color: "#ff2d78",
      });
    });
  });

  it("calls onCancel when cancel clicked", () => {
    const onCancel = vi.fn();
    renderForm({ ...mockProps, onCancel });
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(onCancel).toHaveBeenCalled();
  });

  it("validates name max length (60 chars)", async () => {
    renderForm();
    const nameInput = screen.getByLabelText(/Project Name/i);
    const longName = "a".repeat(61);

    fireEvent.change(nameInput, { target: { value: longName } });
    fireEvent.click(screen.getByText(/Save Project/i));

    await waitFor(() => {
        expect(screen.getByText(/Name must be 60 characters or less/i)).toBeInTheDocument();
    });
  });
});
