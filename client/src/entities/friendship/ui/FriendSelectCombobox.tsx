import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/shared/ui";
import { cn } from "@/shared/lib";
import { useFriends } from "../model/useFriends";

export function FriendSelectCombobox({
  value,
  onChange,
}: {
  value: { name: string; id?: string };
  onChange: (val: { name: string; id?: string }) => void;
}) {
  const { data: friends, isLoading } = useFriends("accepted");
  const anchorRef = useComboboxAnchor();

  const [inputValue, setInputValue] = useState(value.name);
  const [prevName, setPrevName] = useState(value.name);
  if (value.name !== prevName) {
    setPrevName(value.name);
    setInputValue(value.name);
  }

  const safeFriends = friends ?? [];
  const filteredFriends = safeFriends.filter((friend) => {
    const friendFullName =
      `${friend.friendFirstName} ${friend.friendLastName}`.toLowerCase();

    const processedValue = inputValue.toLowerCase();

    return friendFullName.includes(processedValue);
  });

  return (
    <Combobox
      // the value is the ID of the friend if they picked one from the list
      // If it's a custom name, `value` is null/undefined in the Combobox's eyes.
      value={value.id ?? null}
      // When a user specifically CLICKS a friend from the dropdown list
      onValueChange={(selectedId) => {
        if (!selectedId) return;

        // Stranger sentinel — user clicked the fallback item, commit the typed name as-is
        if (selectedId === '__stranger__') {
          onChange({ name: inputValue, id: undefined });
          return;
        }

        // Find the full friend object using the ID
        const selectedFriend = safeFriends.find(
          (f) => f.friendId === selectedId,
        );
        if (selectedFriend) {
          const fullName = `${selectedFriend.friendFirstName} ${selectedFriend.friendLastName}`;

          // Update the input box text visually
          setInputValue(fullName);

          // Bubble up both the Full Name AND the ID to our overall Form State
          onChange({
            name: fullName,
            id: selectedId,
          });
        }
      }}
    >
      <div ref={anchorRef} className="h-full w-full">
        <ComboboxInput
          placeholder={isLoading ? "Loading Friends..." : "With Whom?"}
          value={inputValue}
          onChange={(e) => {
            const newName = e.target.value;
            setInputValue(newName);

            // If they are explicitly typing, we assume it's a completely new, unregistered person
            // So we wipe out the ID, and just pass the name up to the Form State
            onChange({
              name: newName,
              id: undefined,
            });
          }}
          className={cn(
            "[&_input]:placeholder:text-primary/25 [&_input]:text-primary h-auto bg-transparent! [&_input]:h-auto [&_input]:py-3 [&_input]:text-xs [&_input]:tracking-wide",
            inputValue && "[&_input]:font-medium",
          )}
        />
      </div>

      {/*
        Only show the dropdown content if they haven't exactly matched a friend's name,
        and there are actually friends to show.
      */}
      {(filteredFriends.length > 0 ||
        (inputValue && inputValue.trim().length > 0)) && (
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList className="no-scrollbar overflow-y-auto mask-[linear-gradient(to_bottom,transparent,black_10px,black_calc(100%-15px),transparent)]">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <ComboboxItem
                  key={friend.friendId}
                  value={friend.friendId}
                  className="group flex flex-col items-start gap-0 text-xs tracking-wide"
                >
                  <span className="opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                    {friend.friendFirstName} {friend.friendLastName}
                  </span>
                  <span className="text-primary/40 opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                    @{friend.friendUsername}
                  </span>
                </ComboboxItem>
              ))
            ) : (
              <ComboboxItem
                value="__stranger__"
                className="group flex flex-col items-start gap-0 text-xs"
              >
                <span className="opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                  {inputValue}
                </span>
                <span className="text-primary/50 opacity-50 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
                  Stranger
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      )}
    </Combobox>
  );
}
