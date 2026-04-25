import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { PostFilters as Filters } from '@/services/post.service';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface PostFiltersProps {
  onFiltersChange: (filters: Filters) => void;
}

export function PostFilters({ onFiltersChange }: PostFiltersProps) {
  const [courseTag, setCourseTag] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [search, setSearch] = useState('');

  const apply = useCallback(() => {
    onFiltersChange({
      courseTag: courseTag.trim() || undefined,
      difficultyLevel: difficultyLevel || undefined,
      search: search.trim() || undefined,
    });
  }, [courseTag, difficultyLevel, search, onFiltersChange]);

  const reset = () => {
    setCourseTag('');
    setDifficultyLevel('');
    setSearch('');
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          className="pl-8"
        />
      </div>
      <Input
        placeholder="Course tag"
        value={courseTag}
        onChange={(e) => setCourseTag(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        className="w-36"
      />
      <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={apply} size="sm">Filter</Button>
      {(courseTag || difficultyLevel || search) && (
        <Button onClick={reset} variant="ghost" size="sm">Clear</Button>
      )}
    </div>
  );
}
